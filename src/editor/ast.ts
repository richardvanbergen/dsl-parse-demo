import { isGrammarType } from "./parser"

import type {
  ParsedArithmetic,
  ParsedFormula,
  ParsedFunction,
  ParsedGrammar,
  ParsedReference
} from './grammarTypes'

export type GraphState = Map<string, {
  color: 'white' | 'gray' | 'black',
}>

export class GraphValidationError extends Error {
  state: GraphState
  dependentsGraph: Map<string, Set<string>>

  constructor(message: string, graphState: GraphState, dependentsGraph: Map<string, Set<string>>) {
    super(message)
    this.state = graphState
    this.dependentsGraph = dependentsGraph
  }
}

export function validateDependantsGraph(field: string, dependentsGraph: Map<string, Set<string>>, state: GraphState = new Map()) {
  const fieldState = state.get(field)

  // this field is already visited and OK so mark as black
  if (fieldState?.color === 'black') {
    return
  }

  // this field is already visited and not OK so mark as gray
  if (fieldState?.color === 'gray') {
    throw new GraphValidationError(
      `Circular dependency detected: ${field}`,
      state,
      dependentsGraph
    )
  }

  // mark as being visited
  state.set(field, { color: 'gray' })

  // visit children
  const children = dependentsGraph.get(field)
  if (children?.size) {
    children.forEach(child => {
      validateDependantsGraph(child, dependentsGraph, state)
    })
  }

  // mark as visited and ok
  state.set(field, { color: 'black' })
}

export function getFieldDependencies(nodeList: ParsedGrammar[]) {
  const astReferences = nodeList.filter(node => node.type === 'reference') as ParsedReference[]
  return new Set(astReferences.map(node => node.value.identifier))
}

export function updateDependantsGraph(fieldName: string, previousDependencies: Set<string>, currentDependencies: Set<string>, dependantsGraph: Map<string, Set<string>>) {
  const toRemove = new Set([...previousDependencies].filter(x => !currentDependencies.has(x)))

  toRemove.forEach(ref => {
    const set = dependantsGraph.get(ref)
    if (set) {
      set.delete(fieldName)
      if (set.size === 0) {
        dependantsGraph.delete(ref)
      }
    }
  })

  currentDependencies.forEach(ref => {
    const set = dependantsGraph.get(ref) ?? new Set()
    set.add(fieldName)
    dependantsGraph.set(ref, set)
  })

  return dependantsGraph
}

export function *flatten(ast: ParsedGrammar): IterableIterator<ParsedGrammar> {
  const isArithmetic = isGrammarType<ParsedArithmetic>(ast, 'arithmetic')
  const isFormula = isGrammarType<ParsedFormula>(ast, 'formula')
  const isFunction = isGrammarType<ParsedFunction>(ast, 'function')

  if (isFormula) {
    yield ast
    yield* flatten(ast.value)
  }

  if (isArithmetic) {
    yield ast
    yield* flatten(ast.value.left)
    yield ast.value.operator
    yield* flatten(ast.value.right)
  }

  if (isFunction) {
    yield ast
    for (const param of ast.value.params) {
      yield* flatten(param)
    }
  }

  if (!isFormula && !isArithmetic && !isFunction) {
    yield ast as ParsedGrammar
  }
}
