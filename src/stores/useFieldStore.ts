import { acceptHMRUpdate, defineStore } from 'pinia'
import { flatten, GrammarType, ParsedFormula, ParsedGrammar, ParsedReference } from '../editor/parser'
import { stringResolver, createResultResolver, ArithmeticError, FunctionError } from '../editor/resolvers'


type FieldInformation = {
  list: ParsedGrammar[] | undefined
  tree: ParsedFormula | undefined
  references: Set<string> | undefined
}


type GraphContext = {
  fields: Map<string, FieldInformation | null>
  dependencyGraph: Map<string, Set<string>>
}

type GraphState = Map<string, {
  color: 'white' | 'gray' | 'black',
}>

class GraphError extends Error {
  constructor(message: string, graphState: GraphState) {
    console.log(graphState)
    super(message + '\n' + JSON.stringify(graphState, null, 2))
  }
}

function generateGraph(field: string, state: GraphState, context: GraphContext) {
  const fieldState = state.get(field)

  // this field is already visited and OK so mark as black
  if (fieldState?.color === 'black') {
    return
  }

  // this field is already visited and not OK so mark as gray
  if (fieldState?.color === 'gray') {
    throw new GraphError(`Circular dependency detected: ${field}`, state);
  }

  // mark as being visited
  state.set(field, { color: 'gray' })

  // visit children
  const children = context.dependencyGraph.get(field)
  if (children?.size) {
    children.forEach(child => {
      generateGraph(child, state, context)
    })
  }

  // mark as visited and ok
  state.set(field, { color: 'black' })
}

export const useFieldStore = defineStore('fieldStore', {
  state: () => ({
    counter: 1,
    focusedField: "",
    resolvedValues: new Map<string, unknown>(),
    dependencyGraph: new Map<string, Set<string>>(),
    input: new Map<string, unknown>(),
    fields: new Map<string, FieldInformation | null>(),
  }),
  getters: {
    debugDependants: function(): { dependsOn: string, updatedBy: string } {
      const updatedBy: string[] = []
      this.fieldAst?.references?.forEach(ref => {
        const dependants = this.dependencyGraph.get(ref) ?? new Set()
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
        return stringResolver(ast.tree) ?? ''
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
      const dependents = this.dependencyGraph.get('input') ?? []
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

          const dependents = this.dependencyGraph.get(field) ?? []
          dependents.forEach(dependent => {
            this.resolveField(dependent)
          })
        } catch (e) {
          if (e instanceof ArithmeticError) {
            this.resolvedValues.set(field, e.message)
            return
          }
          if (e instanceof FunctionError) {
            this.resolvedValues.set(field, e.message)
            return
          }

          throw e
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
        const set = this.dependencyGraph.get(ref)
        if (set) {
          set.delete(field)

          if (set.size === 0) {
            this.dependencyGraph.delete(ref)
          }
        }
      })

      try {
        generateGraph(field, new Map(), {
          fields: this.fields,
          dependencyGraph: this.dependencyGraph,
        })
      } catch (e) {
        console.error(e)
        return
      }

      // re-add references that are new, allow set to remove duplicates
      newReferences.forEach(ref => {
        const set = this.dependencyGraph.get(ref) ?? new Set()
        set.add(field)
        this.dependencyGraph.set(ref, set)
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
