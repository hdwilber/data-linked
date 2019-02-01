import { checkWillSave, getSpecInfo, getSpecKeys } from './utils'
import defaults from './defaults'

export function save(rawSpec, data, current) {
  const { isArray, spec, keys } = getSpecInfo(rawSpec)
  if (isArray) {
    const { _findInArray } = spec
    return Array.isArray(data) ? data.map((d) => {
      const currentEl = typeof _findInArray === 'function'
        ? _findInArray(d, data)
        : defaults.findInArray(d, data)
      return save(spec, d, currentEl)
    }) : []
  }

  if (keys.length > 0) {
    const values = {}
    const result = keys.reduce((acc, key) => {
      const { isArray: subIsArray, spec: subSpec } = getSpecInfo(spec[key])
      const { _save } = subSpec

      const res = save(spec[key], data && data[key], current && current[key])

      if (typeof res !== 'undefined') {
        if (typeof res !== 'function') {
          if (_save) {
            const { as, create } = _save
            if (subIsArray && create) {
              acc[key] = res
            } else if (Array.isArray(create)) {
              acc[key] = res
            } else {
              values[as || key] = res
            }
          } else {
            values[key] = res
          }
        } else {
          acc[key] = res
        }
      }
      return acc
    }, {})

    const { _save } = spec
    if (_save) {
      const { create } = _save

      const willSave = checkWillSave(_save, values, current)
      result._self = null
      if (willSave && create) {
        if (Array.isArray(create)) {
          result._self = create.map(cr => cr(values, current))
        } else {
          result._self = create(values, current)
        }
      }
      return result
    }
    return values
  }
  const { _save } = spec
  if (_save) {
    const { format } = _save
    return format ? format(data) : data
  }
  return data
}

export function fill(rawSpec, data) {
  const { isArray, spec, keys } = getSpecInfo(rawSpec)
  if (isArray) {
    if (Array.isArray(data)) {
      return data.map(d => fill(spec, d))
    }
    return []
  }
  if (keys.length > 0) {
    return keys.reduce((acc, key) => {
      const { spec: subSpec } = getSpecInfo(spec[key])
      const { _target } = subSpec

      const res = fill(spec[key], data && data[_target || key])
      if (typeof res !== 'undefined') {
        acc[key] = res
      }
      return acc
    }, {})
  }
  const { _default, _format } = spec
  if (_format) {
    return _format(data)
  }
  if (typeof data === 'undefined') {
    return typeof _default === 'function' ? _default() : _default
  }
  return data
}

export function clear(rawSpec) {
  const { isArray, spec, keys } = getSpecInfo(rawSpec)
  if (isArray) {
    return []
  }
  if (keys.length > 0) {
    return keys.reduce((acc, key) => {
      const res = clear(spec[key])
      if (typeof res !== 'undefined') {
        acc[key] = res
      }
      return acc
    }, {})
  }
  const { _default } = spec
  return typeof _default === 'function' ? _default() : _default
}

export async function processSave(spec, info, data) {
  if (Array.isArray(info)) {
    const { _save: { isSync } } = spec
    if (isSync) {
      const resp = info.reduce(async (acc, i) => {
        const curr = await acc

        if (!data.siblings) {
          data.siblings = []
        }
        data.siblings = curr

        const response = await processSave(spec, i, data)
        return curr.concat([{ response }])
      }, Promise.resolve([]))
      return resp
    }
    const resp = Promise.all(info.map(i => processSave(spec, i, data)))
    return resp
  }
  const resInfo = info(data)
  const { request } = resInfo

  const { resultHandler } = spec._save
  const selfResult = await (resultHandler ? resultHandler(request) : request)

  return selfResult
}

export async function runSave(rawSpec, info, data) {
  const { isArray, spec } = getSpecInfo(rawSpec)

  if (isArray) {
    return Array.isArray(info)
      ? Promise.all(info.map(i => runSave(spec, i, data)))
      : []
  }
  const { _self } = info

  const selfResult = _self && await processSave(spec, _self, data)
  const newData = {
    parent: data,
    ...selfResult,
  }

  const saveKeys = getSpecKeys(info)

  const result = await saveKeys.reduce(async (acc, key) => {
    const current = await acc
    current[key] = await runSave(spec[key], info[key], { parent: newData })
    return current
  }, Promise.resolve({}))

  result._self = selfResult
  return result
}
