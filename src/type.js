export function getSpecInfo(rawSpec) {
  const isArray = Array.isArray(rawSpec)
  const spec = isArray ? rawSpec[0] : rawSpec
  const keys = Object.keys(spec).filter(name => name.indexOf('_') !== 0)

  return {
    isArray,
    spec,
    keys,
  }
}

class TypeManager {
  constructor(specs) {
    this.specs = specs
    this.keys = Object.keys(specs).filter(name => name.indexOf('_') !== 0)
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

  clear() {
    return this._clear(this.specs)
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
        const { _target } = spec[key]
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

  _save(rawSpec, data) {
    const { isArray, spec, keys } = getSpecInfo(rawSpec)
    if (isArray) {
      return Array.isArray(data) ? data.map(d => this._save(spec, d)) : []
    }

    if (keys.length > 0) {
      const values = {}
      const result = keys.reduce((acc, key) => {
        const { isArray: subIsArray, spec: subSpec } = getSpecInfo(spec[key])
        const { _save } = subSpec

        const res = this._save(spec[key], data && data[key])

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
        if (create) {
          if (Array.isArray(create)) {
            result._self = create.map(cr => cr(values))
          } else {
            result._self = create(values)
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
          console.log(response)
          //curr.push(response)
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

    const saveKeys = Object.keys(info).filter(name => name.indexOf('_') !== 0)
    const result = await saveKeys.reduce(async (acc, key) => {
      const current = await acc
      current[key] = await this._runSave(spec[key], info[key], { parent: newData})
      return current
    }, Promise.resolve({}))

    result._self = selfResult
    return result
  }

  runSave(info) {
    return this._runSave(this.specs, info, {})
  }

  save(data) {
    return this._save(this.specs, data)
  }

  fill(data) {
    return this._fill(this.specs, data)
  }
}

export default TypeManager
