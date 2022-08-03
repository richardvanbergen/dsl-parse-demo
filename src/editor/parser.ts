// @ts-expect-error no types
import {Grammar, Parser} from "nearley"
import grammar from "./grammar"

export type GrammarPrimitive = 'boolean' | 'number'  | 'plus' | 'minus' | 'times' | 'divide' | 'exponent' | 'string'

export type GrammarType =  'formula' | 'function' | 'arithmetic' | 'reference' | GrammarPrimitive

export interface ParsedGrammar {
  type: GrammarType
  value: unknown
  text: string
  offset: number
  lineBreaks: number
  line: number
  col: number
}

export interface ParsedPrimitive extends ParsedGrammar {
  type: GrammarPrimitive
}

export interface ParsedBoolean extends ParsedPrimitive {
  type: 'boolean'
  value: boolean
}

export interface ParsedNumber extends ParsedPrimitive {
  type: 'number'
  value: number
}

export interface ParsedPlus extends ParsedPrimitive {
  type: 'plus'
  value: '+'
}

export interface ParsedMinus extends ParsedPrimitive {
  type: 'minus'
  value: '-'
}

export interface ParsedTimes extends ParsedPrimitive {
  type: 'times'
  value: '*'
}

export interface ParsedDivide extends ParsedPrimitive {
  type: 'divide'
  value: '/'
}

export interface ParsedExponent extends ParsedPrimitive {
  type: 'exponent'
  value: '^'
}

export interface ParsedString extends ParsedPrimitive {
  type: 'string'
  value: string
}

export interface ParsedReference extends ParsedGrammar {
  type: 'reference'
  value: {
    identifier: string
    subpath: string[]
  }
}

export interface ParsedFunction extends ParsedGrammar {
  type: 'function'
  value: {
    name: string
    params: ParsedFormulaValue[]
  }
}

export type ParsedOperator = ParsedPlus | ParsedMinus | ParsedTimes | ParsedDivide | ParsedExponent

export type ParsedFormulaValue =
  ParsedArithmetic |
  ParsedBoolean |
  ParsedNumber |
  ParsedString |
  ParsedFunction

export interface ParsedArithmetic extends ParsedGrammar {
  type: 'arithmetic'
  value: {
    left: ParsedArithmetic | ParsedNumber | ParsedReference
    operator: ParsedOperator
    right: ParsedArithmetic | ParsedNumber | ParsedReference
  }
}

export interface ParsedFormula extends ParsedGrammar {
  type: "formula"
  value: ParsedArithmetic | ParsedBoolean | ParsedNumber | ParsedFunction | ParsedReference
}

export function isGrammarType<T extends ParsedGrammar>(value: ParsedGrammar, type: GrammarType): value is T {
  return value.type === type
}

export function isPrimitive(value: ParsedGrammar): value is ParsedPrimitive {
  return ['number', 'string', 'divide', 'times', 'plus', 'minus'].includes(value.type)
}

export class IncompleteInputError extends Error {}

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

export function parse(formula: string) {
  const parserTest = new Parser(Grammar.fromCompiled(grammar));
  const results = parserTest.feed(formula)?.results

  if (results) {
    if (results.length > 1) {
      throw new Error("Ambiguous grammar detected.")
    }

    if (results.length < 1) {
      throw new IncompleteInputError("Syntax error. Unexpected end of input.")
    }

    if (isGrammarType<ParsedFormula>(results?.[0]?.[0], 'formula')) {
      return results[0][0]
    }

    throw new Error(`If you see this, please report a bug to the parser library with this input: ${formula}`)
  }
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
