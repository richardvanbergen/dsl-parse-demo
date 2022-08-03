import { isGrammarType } from "./parser"

import type {
  ParsedArithmetic,
  ParsedFormula,
  ParsedFunction,
  ParsedGrammar,
  ParsedReference
} from './grammarTypes'

type GraphState = Map<string, {
  color: 'white' | 'gray' | 'black',
}>

export class GraphError extends Error {
  constructor(message: string, graphState: GraphState) {
    console.log(graphState)
    super(message + '\n' + JSON.stringify(graphState, null, 2))
  }
}

function checkCircularDeps(field: string, state: GraphState, dependencyGraph: Map<string, Set<string>>) {
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
  const children = dependencyGraph.get(field)
  if (children?.size) {
    children.forEach(child => {
      checkCircularDeps(child, state, dependencyGraph)
    })
  }

  // mark as visited and ok
  state.set(field, { color: 'black' })
}

export function generateDependantsGraph(fieldName: string, currentDependencies: Set<string>, context: {
  nodeList: ParsedGrammar[],
  dependantsGraph: Map<string, Set<string>>,
}) {
  const astReferences = context.nodeList.filter(node => node.type === 'reference') as ParsedReference[]
  const newReferences = new Set(astReferences.map(node => node.value.identifier))
  const toRemove = new Set([...currentDependencies].filter(x => !newReferences.has(x)))

  toRemove.forEach(ref => {
    const set = context.dependantsGraph.get(ref)
    if (set) {
      set.delete(ref)

      if (set.size === 0) {
        context.dependantsGraph.delete(ref)
      }
    }
  })

  newReferences.forEach(ref => {
    const set = context.dependantsGraph.get(ref) ?? new Set()
    set.add(fieldName)
    context.dependantsGraph.set(ref, set)
  })

  checkCircularDeps(fieldName, new Map(), context.dependantsGraph)

  return {
    fieldDependencies: newReferences,
    dependantsGraph: context.dependantsGraph
  }
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
