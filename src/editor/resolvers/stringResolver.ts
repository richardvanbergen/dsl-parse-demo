import {createResolver} from "../resolve";

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
