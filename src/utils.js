export function getSpecKeys(specs) {
  return Object.keys(specs).filter(name => name.indexOf('_') !== 0)
}

export function getSpecInfo(rawSpec) {
  const isArray = Array.isArray(rawSpec)
  const spec = isArray ? rawSpec[0] : rawSpec
  const keys = getSpecKeys(spec)

  return {
    isArray,
    spec,
    keys,
  }
}

