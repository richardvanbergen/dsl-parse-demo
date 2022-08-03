import {syntaxTree} from '@codemirror/language'
import {Completion, CompletionContext} from '@codemirror/autocomplete'
import {EditorView} from 'codemirror'
import get from 'lodash/get'
import isObject from 'lodash/isObject'
import {registeredFunctions, toCompletions} from './functions'
import {storeToRefs} from 'pinia'

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

function inspectObject(search: string, target = {}) {
  return Object
    .keys(target)
    .filter(inputKey => inputKey.startsWith(search))
}

const getReferenceCompletions = (text: string, fieldName: string, inputs: Record<string, unknown>): {
  label: string,
  type: string,
  detail?: string,
  info?: string
}[] => {
  const filteredInputs: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(inputs)) {
    if (key !== fieldName) {
      filteredInputs[key] = value
    }
  }

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

    switch (items.length) {
      case 0:
        return inspectObject("", filteredInputs).map(key => ({ label: key, type: 'variable' }))
      case 1:
        return inspectObject(items[0], filteredInputs).map(key => ({ label: key, type: 'variable' }))
      default:
        const target = get(filteredInputs, items.slice(0, -1))
        if (isObject(target)) {
          return inspectObject(items.at(-1) ?? "", target).map(key => ({ label: key, type: 'variable' }))
        }
    }
  } else {
    const keys = [...Object.keys(filteredInputs)]
    return [
      ...(keys.map(key => ({label: `$${key}`, type: 'variable', detail: 'Node'}))),
      ...toCompletions(registeredFunctions)
    ]
  }

  return []
}

export async function autocomplete(context: CompletionContext) {
  let word = context.matchBefore(/\w*/)
  let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
  const isReferenceNode = nodeBefore.name === "Reference"
  const isReferenceChild = nodeBefore.parent?.name === "Reference" && nodeBefore.name === "Identifier"

  const { useFieldStore } = await import('../stores/useFieldStore')
  const { focusedField, formulaInput } = storeToRefs(useFieldStore())

  if (isReferenceNode || isReferenceChild) {
    const parentObj = nodeBefore.parent
    const content = context.state.sliceDoc(parentObj?.from, parentObj?.to)

    return {
      from: word?.from,
      options: [
        ...getReferenceCompletions(content, focusedField.value, formulaInput.value).map(f => (
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
        ...getReferenceCompletions(content, focusedField.value, formulaInput.value).map(f => (
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
