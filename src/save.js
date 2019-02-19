import _isEqual from 'lodash/isEqual'
import { checkWillSave, getSpecInfo, getSpecKeys } from './utils'
import defaults from './defaults'

// RawSpec
// data: the actual modified data
// current: the original not-modified data
export function createSavingInformation(rawSpec, data, current) {
  const { isArray, spec, keys } = getSpecInfo(rawSpec)
  if (isArray) {
    const { _findInArray } = spec
    return Array.isArray(data) ? data.map((d) => {
      const currentEl = typeof _findInArray === 'function'
        ? _findInArray(d, current)
        : defaults.findInArray(d, current)
      return save(spec, d, currentEl)
    }) : []
  }

  if (keys.length > 0) {
    // Results for current instance for self data
    const values = {}
    // Results for current instances inside instance
    const result = keys.reduce((acc, key) => {
      const { isArray: subIsArray, spec: subSpec } = getSpecInfo(spec[key])
      const { _save } = subSpec

      const res = save(spec[key], data && data[key], current && current[key])

      // do nothing if undefined
      if (typeof res === 'undefined') return acc

      const { as, create } = _save
      if (res) {
        if (!res._self) {

          values[as || key] = res
        } else {
          acc[key] = res
        }
      }
      return acc
    })

    const { _save } = spec
    if (_save) {
      const { create } = _save
      const willSave = checkWillSave(_save, values, current)
      console.log('la puta madre');
      console.log(spec)
      console.log(result);
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
    const { format, create } = _save
    const formattedData = format ? format(data) : data
    const formattedCurrent = format ? format(current) : current

    const willSave = checkWillSave(_save, formattedData, formattedCurrent)
    const result = {}
    result._self = null
    if (willSave) {
      if (create) {
        if (Array.isArray(create)) {
          result._self = create.map(cr => cr(formattedData, current))
        } else {
          result._self = create(formattedData, current)
        }
      } else {
        return formattedData
      }
    }
    return result
  }
  return data
}
