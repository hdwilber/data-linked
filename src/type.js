import { getSpecKeys } from './utils'
import * as core from './core'

class TypeManager {
  constructor(specs) {
    this.specs = specs
    this.keys = getSpecKeys(specs)
  }

  clear() {
    return core.clear(this.specs)
  }

  save(data, current) {
    return core.save(this.specs, data, current)
  }

  fill(data) {
    this.rawData = data
    return core.fill(this.specs, data)
  }

  restore() {
    if (this.rawData) {
      return core.fill(this.rawData)
    }
    return core.clear()
  }

  runSave(info) {
    return core.runSave(this.specs, info, {})
  }
}

export default TypeManager
