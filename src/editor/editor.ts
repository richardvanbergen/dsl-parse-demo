import {EditorView, basicSetup } from "codemirror"

import { styleTags, tags as t } from "@lezer/highlight"
import { LRLanguage, LanguageSupport, syntaxTree, language } from "@codemirror/language"
import { EditorState, Compartment } from "@codemirror/state"
import { markdown } from "@codemirror/lang-markdown"
import { linter, Diagnostic } from "@codemirror/lint"
import {IncompleteInputError, parse, ParsedFormula} from "./parser"
// @ts-expect-error no types
import { parser } from "./lezer.js"
import { autocomplete } from "./autocomplete"

export function newEditor(element: HTMLElement, updateHooks?: ((value?: ParsedFormula) => void)[]) {
  let parserWithMetadata = parser.configure({
    props: [
      styleTags({
        FormulaIdentifier: t.brace,
        Boolean: t.bool,
        Number: t.number,
        Operator: t.bitwiseOperator,
        String: t.string,
        Identifier: t.keyword,
        Reference: t.className,
        ParenLeft: t.paren,
        ParenRight: t.paren,
      }),
    ]
  })

  const myLanguage = LRLanguage.define({
    parser: parserWithMetadata
  })

  const newLang = () => new LanguageSupport(myLanguage, [
    myLanguage.data.of({
      autocomplete
    })
  ])

  const regexpLinter = linter(view => {
    let diagnostics: Diagnostic[] = []
    syntaxTree(view.state).cursor().iterate(node => {
      if (node.type.isError) {
        const doc = view.state.doc.toString()
        try {
          parse(doc)
        } catch (e) {
          if (e instanceof IncompleteInputError) {
            diagnostics.push({
              from: node.from,
              to: node.to,
              severity: "error",
              message: e.message
            })
          } else {
            const error = e as any
            if (error.token) {
              const token = error.token
              const message = error.message
              const expected = message.match(/(?<=A ).*(?= based on:)/g).map((s: string) => s.replace(/\s+token/i,''));
              const newMessage = `Unexpected ${token.type} token "${token.value}" `+
                `at line ${token.line} col ${token.col}`;
              if (expected && expected.length) {
                // newMessage += ` Tokens expected: ${[...new Set(expected)].join(', ')}`;
              }

              diagnostics.push({
                from: node.from,
                to: node.to,
                severity: "error",
                message: newMessage,
              })
            } else {
              diagnostics.push({
                from: node.from,
                to: node.to,
                severity: "error",
                message: "Syntax error. Unexpected end of input.",
              })
            }
          }
        }
      }
    })
    return diagnostics
  })

  const languageConf = new Compartment

  const autoLanguage = EditorState.transactionExtender.of(tr => {
    if (!tr.docChanged) {
      return null
    }

    let docIsCustom = /^\s*=/.test(tr.newDoc.sliceString(0, tr.newDoc.length))
    let stateIsCustom = tr.startState.facet(language) == myLanguage
    if (docIsCustom == stateIsCustom) {
      return null
    }

    return {
      effects: languageConf.reconfigure(docIsCustom ? newLang() : markdown())
    }
  })

  const updateListener = EditorView.updateListener.of(update => {
      if (updateHooks?.length) {
        for (const hook of updateHooks) {
          try {
            const parsed = parse(update.state.doc.toString())
            if (parsed) {
              hook(parsed)
            }
          } catch (e) {
            hook()
          }
        }
      }
  })

  new EditorView({
    extensions: [
      basicSetup,
      languageConf.of(markdown()),
      regexpLinter,
      autoLanguage,
      updateListener
    ],
    parent: element
  })
}
