import {createResolver} from "../resolve";
import get from "lodash/get";

export const stringResolver = createResolver<string>({
  function: (name, params) => {
    return `${name}(${params.join(', ')})`
  },
  arithmetic: (left, operator, right) => {
    return `(${left} ${operator} ${right})`
  },
  primitive: (value) => {
    if (typeof value === 'string') {
      return `"${value}"`
    }

    return value
  },
  scopedReference(path, context) {
    if (path.length === 0) {
      return context
    }

    return get(context, path)
  },
  boolean: (value) => value ? 'true' : 'false',
  comparison: (a, operator, b) => {
    return `${a} ${operator.value} ${b}`
  },
  reference: (identifier, subPaths) => {
    let combine: string[] = [identifier]
    if (subPaths && subPaths.length > 0) {
      combine = [...combine, ...subPaths]
    }
    return `$${combine.join('.')}`
  },
})
