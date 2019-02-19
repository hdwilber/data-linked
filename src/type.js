import { getSpecKeys } from './utils'
import * as core from './core'
import { createSavingInformation } from './save'

class TypeManager {
  constructor(specs) {
    this.specs = specs
    this.keys = getSpecKeys(specs)
  }

  clear() {
    return core.clear(this.specs)
  }

  save(data, current) {
    return createSavingInformation(this.specs, data, current)
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

  runSave(info, data, options) {
    return core.runSave(this.specs, info, data, options)
  }
}

export default TypeManager
