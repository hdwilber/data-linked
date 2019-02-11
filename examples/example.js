import { TypeManager, Types, MoreTypes } from '../src';
import getUserInstance from './user'
import _isEqual from 'lodash/isEqual'

const idSpec = {
  _default: () => (Math.random() * 40),
  _primary: true,
}

export const geoLocationSpec = {
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

const baseInstitutionSpec = {
  id: idSpec,
  categories: {
    _id: 'cat',
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
  logo: {
    _id: 'logo',
    _default: {
      url: null,
      file: null,
      fakeUrl: null
    },
    _save: {
      checkBeforeCreate: (values, current, data) => {
        return !!values.file
      },
      create: (data, current) => {
        return (upstreamData, options) => {
          console.log('saving logo')
          console.log('saving logo')
          console.log('saving logo')
          console.log('saving logo')
          console.log('saving logo')
          console.log(upstreamData)
          return {
            name: 'Saving one',
            request: Promise.resolve(2)
          }
        }
      },
    },
    _target: 'logoId',
    _format: data => {
      if (data) {
        return {
          url: buildImageUrl(data),
        }
      }
      return {
        url: null,
        file: null,
        fakeUrl: null,
      }
    },
  },

  geoLocation: geoLocationSpec,
  _save: {
    create: (data, current) => {
      console.log('to save')
      console.log(data)
      return (parent, options) => {
        return {
          name: 'Saving institution',
          request: Promise.resolve(data)
        }
      }
    }
  }
}

const iid = '6ec03386-3fb4-494d-be05-2cd7f286c559'
const url = 'http://localhost:3100/api/institutions/' + iid

const InstitutionType = new TypeManager(baseInstitutionSpec)
fetch(url).then(res => res.json())
.then(({institution}) => {
  console.log(institution)
  const modified = InstitutionType.fill(institution)
  const original = InstitutionType.fill(institution)
  modified.categories  = [{id: 10,}, {id: 15}]
  original.categories = [{id: 10,}, {id: 15}]
  modified.geoLocation = {
    point: null,
    zoom: 50,
  }
  modified.logo = {
    file: 'Some file',
  }



  console.log(original)
  console.log(modified)

  const saveInfo = InstitutionType.save(modified, original)
  console.log('SAVE INFO')
  console.log(saveInfo)

  InstitutionType.runSave(saveInfo, original).then(result => {
    console.log(result)
  })
})

