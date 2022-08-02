import {syntaxTree} from "@codemirror/language"
import {Completion, CompletionContext} from "@codemirror/autocomplete"
import {EditorView} from "codemirror"
import {get, isObject} from "lodash"
import { registeredFunctions, toCompletions } from './functions'

const insertFunction = (view: EditorView, completion: Completion, from: number, to: number) => {
  const text = `${completion.label}`
  if (completion.type === "keyword") {
    view.dispatch({
      changes: {
        from,
        to,
        insert: text
      },
      scrollIntoView: true,
      selection: {anchor: from + text.length - 1},
    })
  }

  if (completion.type === "variable") {
    view.dispatch({
      changes: {
        from,
        to,
        insert: text
      },
      scrollIntoView: true,
      selection: { anchor: from + text.length },
    })
  }
}

const insertReference = (view: EditorView, completion: Completion, from: number, to: number) => {
  const text = completion.label
  if (text.match(/^\d+$/)) {
    view.dispatch({
      changes: {
        from: from - 1,
        to,
        insert: `[${text}]`
      },
      scrollIntoView: true,
      selection: {anchor: from + text.length + 1},
    })
  } else {
    view.dispatch({
      changes: {
        from,
        to,
        insert: text
      },
      scrollIntoView: true,
      selection: {anchor: from + text.length},
    })
  }
}

const inputs = {
  input: {
    planId: 2,
    age: 34
  },
  nodes: {
    product1: {
      name: 'AXA Home',
      grossPrice: 200,
      tax: 20,
    },
    worksheet2: {
      testTable: [
        { name: 'John', age: 34 },
        { name: 'Jane', age: 35 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
        { name: 'Jack', age: 36 },
      ]
    }
  }
}

function inspectObject(search: string, target = {}) {
  return Object
    .keys(target)
    .filter(inputKey => inputKey.startsWith(search))
}

const getReferenceCompletions = async (text: string): Promise<{
  label: string,
  type: string,
  detail?: string,
  info?: string
}[]> => {
  return new Promise(async (resolve) => {
    if (text.startsWith("$")) {
      const items = text.slice(1).split(".").reduce((acc: string[], cur: string) => {
        const startBracketIndex = cur.indexOf('[')
        const endBracketIndex = cur.indexOf(']')

        if (startBracketIndex !== -1 && endBracketIndex !== -1) {
          const id = cur.slice(0, startBracketIndex)
          const arrIndex = cur.slice(startBracketIndex + 1, endBracketIndex)
          return [...acc, id, arrIndex]
        }

        return [...acc, cur]
      },[])

      const availableNodes = {
        ...inputs.nodes,
        input: inputs.input
      }

      switch (items.length) {
        case 0:
          return resolve(inspectObject("", availableNodes).map(key => ({ label: key, type: 'variable' })))
        case 1:
          return resolve(inspectObject(items[0], availableNodes).map(key => ({ label: key, type: 'variable' })))
        default:
          const target = get(availableNodes, items.slice(0, -1))
          if (isObject(target)) {
            return resolve(inspectObject(items.at(-1) ?? "", target).map(key => ({ label: key, type: 'variable' })))
          }
      }
    } else {
      const { nodes } = inputs
      const completions = [
        {label: `$input`, type: 'variable', detail: 'User Input'},
        ...Object.keys(nodes).map(key => ({label: `$${key}`, type: 'variable', detail: 'Node'})),
        ...toCompletions(registeredFunctions)
      ]

      resolve(completions)
    }
  })
}

export async function autocomplete(context: CompletionContext) {
  let word = context.matchBefore(/\w*/)
  let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
  const isReferenceNode = nodeBefore.name === "Reference"
  const isReferenceChild = nodeBefore.parent?.name === "Reference" && nodeBefore.name === "Identifier"

  if (isReferenceNode || isReferenceChild) {
    const parentObj = nodeBefore.parent
    const content = context.state.sliceDoc(parentObj?.from, parentObj?.to)
    return {
      from: word?.from,
      options: [
        ...(await getReferenceCompletions(content)).map(f => (
          {
            label: f.label,
            info: f.info,
            type: f.type,
            apply: insertReference,
          }
        ))
      ]
    }
  }


  const parentObj = nodeBefore.parent
  const content = context.state.sliceDoc(parentObj?.from, parentObj?.to)

  const isStart = content.trim() === "=" && nodeBefore.name === "Formula"
  const isIdentifier = nodeBefore.name === "Identifier" || nodeBefore.name === "Reference"

  if (isStart || isIdentifier) {
    return {
      from: word?.from,
      options: [
        ...(await getReferenceCompletions(content)).map(f => (
          {
            label: f.label,
            detail: f.detail,
            type: f.type,
            info: f.info,
            apply: insertFunction,
          }
        ))
      ]
    }
  }

  return null
}
