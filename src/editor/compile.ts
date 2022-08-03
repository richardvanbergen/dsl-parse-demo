import {
  ParsedReference,
  ParsedGrammar
} from "./parser"

import get from "lodash/get"

type Compiler<T extends ParsedGrammar> = (value: T, inputs?: Record<string, unknown>, resolvedValues?: Map<string, unknown>) => string

export const compileReference: Compiler<ParsedReference> = (reference, inputs, resolvedValues): string => {
  const values = resolvedValues ?? new Map<string, unknown>()
  let combine = [reference.value.identifier]
  if (reference.value.subpath && reference.value.subpath.length > 0) {
    combine = [...combine, ...reference.value.subpath]
  }

  console.log({ ...inputs, ...values })

  const value = get({ ...inputs, ...values }, combine)
  if (value) {
    return value
  }

  return ""
}
