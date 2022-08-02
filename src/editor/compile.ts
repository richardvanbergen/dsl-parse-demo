import {
  ParsedReference,
  ParsedGrammar
} from "./parser"

import get from "lodash/get"

type Compiler<T extends ParsedGrammar> = (value: T, inputs?: Record<string, unknown>) => string

export const compileReference: Compiler<ParsedReference> = (reference, inputs): string => {
  let combine = [reference.value.identifier]
  if (reference.value.subpath && reference.value.subpath.length > 0) {
    combine = [...combine, ...reference.value.subpath]
  }

  const value = get(inputs, combine)
  if (value) {
    return value
  }

  return ""
}
