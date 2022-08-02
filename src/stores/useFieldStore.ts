import { acceptHMRUpdate, defineStore } from 'pinia'
import { flatten, GrammarType, ParsedFormula, ParsedGrammar, ParsedReference } from '../editor/parser'
import { createResolver } from '../editor/resolve'
import { toResolvers, registeredFunctions } from '../editor/functions'
import { divide, multiply, pow, subtract, sum } from 'mathjs'
import get from 'lodash/get'

const functions = toResolvers(registeredFunctions)
// parser should ensure that left and right are both resolvable to a number
// if not then this will throw an error as we have bad input
type OperationFn = (x: unknown, y: unknown) => number

const getOperationFunction = (operation: string) => {
  if (operation === '+') {
    return sum as OperationFn
  }

  if (operation === '-') {
    return subtract as OperationFn
  }

  if (operation === '*') {
    return multiply as OperationFn
  }

  if (operation === '/') {
    return divide as OperationFn
  }

  if (operation === '^') {
    return pow as OperationFn
  }
}

const compiledResolver = createResolver<string>({
  function: (name, params) => {
    return `${name}(${params.join(',')})`
  },
  arithmetic: (left, operator, right) => {
    return `(${left} ${operator} ${right})`
  },
  primitive: (value) => value,
  reference: (identifier, subPaths) => {
    let combine: string[] = [identifier]
    if (subPaths && subPaths.length > 0) {
      combine = [...combine, ...subPaths]
    }
    return `$${combine.join('.')}`
  },
})

class ArithmeticError extends Error {
  constructor(message: string) {
    super(message)
  }
}

const createResultResolver = (inputValues: { input: Record<string, unknown> }) => {
  return createResolver<unknown>({
    function: (name, params) => {
      const toRun = functions.get(name)

      if (toRun) {
        return toRun(params)
      }
    },
    arithmetic: (left, operator, right) => {
      const operationFn = getOperationFunction(operator)

      if (!left) {
        throw new ArithmeticError(`Invalid arithmetic operation. Left side of operation is undefined.`)
      }

      if (!right) {
        throw new ArithmeticError(`Invalid arithmetic operation. Right side of operation is undefined.`)
      }

      if (isNaN(left) || isNaN(right)) {
        throw new ArithmeticError(`Invalid arithmetic operation: ${left} ${operator} ${right}`)
      }

      if (operationFn && left && right) {
        return operationFn(left, right)
      }
    },
    primitive: (value) => value,
    reference: (identifier, subPaths) => {
      let combine = [identifier]
      if (subPaths && subPaths.length > 0) {
        combine = [...combine, ...subPaths]
      }

      return get(inputValues, combine)
    },
  })
}

type FieldInformation = {
  list: ParsedGrammar[] | undefined
  tree: ParsedFormula | undefined
  references: Set<string> | undefined
}

export const useFieldStore = defineStore('fieldStore', {
  state: () => ({
    counter: 1,
    focusedField: "",
    resolvedValues: new Map<string, unknown>(),
    dependants: new Map<string, Set<string>>(),
    input: new Map<string, unknown>(),
    fields: new Map<string, FieldInformation | null>(),
  }),
  getters: {
    debugDependants: function(): { dependsOn: string, updatedBy: string } {
      const updatedBy: string[] = []
      this.fieldAst?.references?.forEach(ref => {
        const dependants = this.dependants.get(ref) ?? new Set()
        if (dependants.has(this.focusedField)) {
          updatedBy.push(ref)
        }
      })

      return {
        dependsOn: [...this.fieldAst?.references ?? []].join(', '),
        updatedBy: [...updatedBy].join(', ')
      }
    },
    debugOutput: function(): { name: string, value: unknown, color: string, description: string }[] {
      const result = this.resolvedOutput
      const formula = this.compiledOutput

      return [
        {
          name: "Result",
          value: result,
          color: "bg-green-600",
          description: "Final result of the formula",
        },
        {
          name: "Formula",
          value: formula,
          color: "bg-purple-600",
          description: "Formula with branch values calculated",
        },
      ]
    },
    resolvedOutput: function(): unknown | undefined {
      return this.resolvedValues.get(this.focusedField)
    },
    compiledOutput: function(): string {
      const ast = this.fieldAst
      if (ast?.tree) {
        return compiledResolver(ast.tree) ?? ''
      }

      return ""
    },
    categorizedNodes: function(): Map<GrammarType, ParsedGrammar[]> {
      return this.nodeList.reduce((acc, node) => {
        const values = acc.get(node.type) ?? []
        acc.set(node.type, [...values, node])
        return acc
      }, new Map<GrammarType, ParsedGrammar[]>())
    },
    nodeList: function (): ParsedGrammar[] {
      if (this.fieldAst?.list) {
        return this.fieldAst.list
      }

      return []
    },
    fieldAst(state) {
      return state.fields.get(state.focusedField)
    },
  },
  actions: {
    setFocusedField(field: string) {
      this.focusedField = field
    },
    updateInput(key: string, value: unknown) {
      this.input.set(key, value)
      const dependents = this.dependants.get('input') ?? []
      dependents.forEach(dependent => {
        this.resolveField(dependent)
      })
    },
    resolveField(field: string) {
      const target = this.fields.get(field)
      if (target?.tree) {
        const resolver = createResultResolver({
          ...Object.fromEntries(this.resolvedValues),
          input: Object.fromEntries(this.input)
        })

        try {
          this.resolvedValues.set(field, resolver(target.tree))
        } catch (e) {
          if (e instanceof ArithmeticError) {
            this.resolvedValues.set(field, e.message)
          }
        }
      }
    },
    updateAst(field: string, ast: ParsedFormula) {
      const flattened = ast ? [...flatten(ast)] : []
      const filtered = flattened
        .filter(node => node.type === 'reference') as ParsedReference[]

      const previousReferences = new Set(this.fields.get(field)?.references ?? [])
      const newReferences = new Set(filtered.map(node => node.value.identifier))

      // get previous references that are not in the new list
      const toRemove = new Set([...previousReferences].filter(x => !newReferences.has(x)))

      // remove references that are no longer used
      toRemove.forEach(ref => {
        const set = this.dependants.get(ref)
        if (set) {
          set.delete(field)

          if (set.size === 0) {
            this.dependants.delete(ref)
          }
        }
      })

      // re-add references that are new, allow set to remove duplicates
      newReferences.forEach(ref => {
        const set = this.dependants.get(ref) ?? new Set()
        set.add(field)
        this.dependants.set(ref, set)
      })

      this.fields.set(field, {
        list: flattened,
        tree: ast,
        references: newReferences
      })

      this.resolveField(field)
    },
    createNewField() {
      const id = `field${this.counter}`
      this.fields.set(id, null)
      this.counter++
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFieldStore, import.meta.hot))
}
