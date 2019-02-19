import { TypeManager, Types, MoreTypes } from '../src';

const idSpec = {
  _default: () => (Math.random() * 40),
  _primary: true,
}

const geoLocationSpec = {
  _default: {
    point: null,
    zoom: 12
  },
  _shouldSave: (value, data) => {
    if (value === null && data === value) {
      return false
    }
    return !_isEqual(value, data)
  }
}

const imageSpec = {
  _default: {
    url: null,
    file: null,
    fakeUrl: null
  },
}


const baseInstitutionSpec = {
  id: idSpec,
  //prename: '',
  name: '',
  phones: [{
    _name: 'phones',
    ...Types.string,
  }],
  //administrativeType: Types.string,
  //administrativeLevel: Types.string,
  //description: Types.string,
  academicLevels: [{
    _name: 'academicLevels',
    ...Types.string
  }],
  logo: {
    ...imageSpec,
    _name: 'logo',
    _save: {
      checkBeforeCreate: (values, current, data) => {
        return !!values.file
      },
      create: (data, current) => {
        return (upstreamData, options) => {
          return {
            name: 'Saving one',
            request: Promise.resolve(data),
          }
        }
      },
    },
    _target: 'logoId',
    _format: data => {
      if (data) {
        return {
          url: 'http://' + data
        }
      }
      return {
        url: null,
        file: null,
        fakeUrl: null,
      }
    },
  },
  categories: {
    _default: [],
    _save: {
      format: cats => {
        if (cats) {
          return cats.map(cat => cat.id)
        }
        return []
      },
    },
  },
  head: {
    _default: null,
    _save: {
      as: 'headId',
      format: (head) => {
        if(head) {
          return head.id
        }
        return null
      },
    },
  },
  address: Types.string,
  country: Types.string,
  state: Types.string,
  county: Types.string,
  province: Types.string,
  geoLocation: geoLocationSpec,
  _save: {
    create: (data, current) => {
      if (Object.keys(data).length > 0) {
        return (parent, options) => {
          const id = data.id || current.id
          return {
            name: 'Saving institution',
            request: Promise.resolve(data)
          }
        }
      }
      return null
    }
  }
}

export default baseInstitutionSpec

