import { checkWillSave, getSpecInfo, getSpecKeys } from './utils'
import defaults from './defaults'

class TypeManager {
  constructor(specs) {
    this.specs = specs
    this.keys = getSpecKeys(specs)
  }


  _clear(rawSpec) {
    const { isArray, spec, keys } = getSpecInfo(rawSpec)
    if (isArray) {
      return []
    }
    if (keys.length > 0) {
      return keys.reduce((acc, key) => {
        const res = this._clear(spec[key])
        if (typeof res !== 'undefined') {
          acc[key] = res
        }
        return acc
      }, {})
    }
    const { _default } = spec
    return typeof _default === 'function' ? _default() : _default
  }

  _fill(rawSpec, data) {
    const { isArray, spec, keys } = getSpecInfo(rawSpec)
    if (isArray) {
      if (Array.isArray(data)) {
        return data.map(d => this._fill(spec, d))
      }
      return []
    }
    if (keys.length > 0) {
      return keys.reduce((acc, key) => {
        const { spec: subSpec } = getSpecInfo(spec[key])
        const { _target } = subSpec

        const res = this._fill(spec[key], data && data[_target || key])
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

  _save(rawSpec, data, current) {
    const { isArray, spec, keys } = getSpecInfo(rawSpec)
    if (isArray) {
      const { _findInArray } = spec
      return Array.isArray(data) ? data.map((d) => {
        const currentEl = typeof _findInArray === 'function'
          ? _findInArray(d, data)
          : defaults.findInArray(d, data)
        return this._save(spec, d, currentEl)
      }) : []
    }

    if (keys.length > 0) {
      const values = {}
      const result = keys.reduce((acc, key) => {
        const { isArray: subIsArray, spec: subSpec } = getSpecInfo(spec[key])
        const { _save } = subSpec

        const res = this._save(spec[key], data && data[key], current && current[key])

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

  async _processSave(spec, info, data) {
    if (Array.isArray(info)) {
      const { _save: { isSync } } = spec
      if (isSync) {
        const resp = info.reduce(async (acc, i) => {
          const curr = await acc

          if (!data.siblings) {
            data.siblings = []
          }
          data.siblings = curr

          const response = await this._processSave(spec, i, data)
          return curr.concat([{ response }])
        }, Promise.resolve([]))
        return resp
      }
      const resp = Promise.all(info.map(i => this._processSave(spec, i, data)))
      return resp
    }
    const resInfo = info(data)
    const { request } = resInfo

    const { resultHandler } = spec._save
    const selfResult = await (resultHandler ? resultHandler(request) : request)

    return selfResult
  }

  async _runSave(rawSpec, info, data) {
    const { isArray, spec } = getSpecInfo(rawSpec)

    if (isArray) {
      return Array.isArray(info)
        ? Promise.all(info.map(i => this._runSave(spec, i, data)))
        : []
    }
    const { _self } = info

    const selfResult = _self && await this._processSave(spec, _self, data)
    const newData = {
      parent: data,
      ...selfResult,
    }

    const saveKeys = getSpecKeys(info)

    const result = await saveKeys.reduce(async (acc, key) => {
      const current = await acc
      current[key] = await this._runSave(spec[key], info[key], { parent: newData })
      return current
    }, Promise.resolve({}))

    result._self = selfResult
    return result
  }

  clear() {
    return this._clear(this.specs)
  }

  save(data, current) {
    return this._save(this.specs, data, current)
  }

  fill(data) {
    this.rawData = data
    return this._fill(this.specs, data)
  }

  restore() {
    if (this.rawData) {
      return this.fill(this.rawData)
    }
    return this.clear()
  }

  runSave(info) {
    return this._runSave(this.specs, info, {})
  }
}

export default TypeManager
