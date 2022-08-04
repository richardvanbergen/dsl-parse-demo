import {createResolver} from "../resolve";

export const stringResolver = createResolver<string>({
  function: (name, params) => {
    return `${name}(${params.join(', ')})`
  },
  arithmetic: (left, operator, right) => {
    return `(${left} ${operator} ${right})`
  },
  primitive: (value) => `"${value}"`,
  boolean: (value) => value ? 'true' : 'false',
  reference: (identifier, subPaths) => {
    let combine: string[] = [identifier]
    if (subPaths && subPaths.length > 0) {
      combine = [...combine, ...subPaths]
    }
    return `$${combine.join('.')}`
  },
})
