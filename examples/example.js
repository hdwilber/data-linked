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
  //id: idSpec,
  //categories: {
    //_id: 'catcat',
    //_default: [],
    //_save: {
      //format: cats => {
        //if (cats) {
          //return cats.map(cat => cat.id)
        //}
        //return []
      //},
    //},
  //},
  //head: {
    //_name:'HEAD',
    //_default: null,
    //_save: {
      //as: 'headId',
      //format: (parent) => {
        //if(parent) {
          //return parent.id
        //}
        //return null
      //},
    //},
  //},

  //logo: {
    //_id: 'logo',
    //_default: {
      //url: null,
      //file: null,
      //fakeUrl: null
    //},
    //_save: {
      //checkBeforeCreate: (values, current, data) => {
          //return false
      //},
      //create: (data, current) => {
        //return (upstreamData, options) => {
          //console.log('saving logo')
          //console.log('saving logo')
          //console.log('saving logo')
          //console.log('saving logo')
          //console.log('saving logo')
          //console.log(upstreamData)
          //return {
            //name: 'Saving one',
            //request: Promise.resolve(2)
          //}
        //}
      //},
    //},
    //_target: 'logoId',
    //_format: data => {
      //if (data) {
        //return {
          //url: buildImageUrl(data),
        //}
      //}
      //return {
        //url: null,
        //file: null,
        //fakeUrl: null,
      //}
    //},
  //},

  //geoLocation: geoLocationSpec,
  _save: {
    create: (data, current) => {
      console.log('to save')
      console.log(data)
      console.log(current);
      return (parent, options) => {
        return {
          name: 'Saving institution',
          request: Promise.resolve(data)
        }
      }
    }
  }
}

const InstitutionSpec = {
  ...baseInstitutionSpec,
  dependencies: [baseInstitutionSpec],
}


const iid = 'ecc4453f-6d35-4639-8b8d-64801965e39d'
const url = 'http://localhost:3100/api/institutions/' + iid

const InstitutionType = new TypeManager(InstitutionSpec)
fetch(url).then(res => res.json())
.then(({institution}) => {
  institution.dependencies = institution.dependencies.slice(0,2)
  const modified = InstitutionType.fill(institution)
  const original = InstitutionType.fill(institution)

  //modified.dependencies[0].name = 'first name'
  //modified.dependencies[0].prename = 'my prename'


  //modified.categories  = [{id: 10,}, {id: 15}]
  //original.categories = [{id: 10,}, {id: 25}]
  //modified.geoLocation = {
    //point: null,
    //zoom: 50,
  //}
  //modified.logo = {
    //file: 'Some file',
  //}



  console.log(original)
  console.log(modified)

  const saveInfo = InstitutionType.save(modified, original)
  console.log('SAVE INFO')
  console.log(saveInfo)

  InstitutionType.runSave(saveInfo, original).then(result => {
    console.log(result)
  })
})

