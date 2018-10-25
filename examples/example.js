import { TypeManager, Types, MoreTypes } from '../src';
import getUserInstance from './user'

const singleInstitution = {
  id: MoreTypes.id,
  prename: Types.string,
  name: Types.string,
  isValid: Types.bool,
  phones: [Types.string],

}

const opportunity = {
  id: MoreTypes.id,
  name: Types.string,
  logo: {
    ...MoreTypes.image,
    _save: {
      create: [
        data => (parent, options) => ({
          name: 'Create Logo in Opportunity',
          request: Promise.resolve('Create Logo Request 1'),
        }),
        data => (parent, options) => ({
          name: 'create logo in oportunity 2',
          request: Promise.resolve('Create Logo Request 2'),
        }),
      ],
    },
  },
  _save: {
    create: data => (parent, options) => ({
      name: 'Save Opportunity type',
      request: Promise.resolve('Opportunity Data'),
    }),
  },
}

function getTimer(time) {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3100/api/institutions/5b1cc66ace94c9ae6aefaeb6')
    .then(s => {
      console.log('starting time for: %o', time)
      setTimeout( () => {
        console.log('complete %o', time)
        resolve(`Time: ${time}`)
      }, time)
    })
  })
}

const institution = {
  ...singleInstitution,
  //head: {
    //_format: data => ({
      //value: data.id,
      //text: data.name,
    //}),
    //_save: {
      //as: 'parentId',
      //format: data => data.value,
    //},
  //},
  logo: {
    ...MoreTypes.image,
    _save: {
      isSync: true,
      create: [
        data => (data, ref) => {
          console.log('----1-')
          console.log(data)
          return {
            name: 'Create Logo in Institution',
            request: getTimer(2000),
          }
        },
        data => (data, ref) => {
          console.log('----2-')
          console.log(data)
          return {
            name: 'Create Logo in Institution - re-query',
            request: getTimer(2000),
          }
        },
      ],
    },
  },
  //simpleHead: {
    //_save: {
      //as: 'minimal-head',
    //},
    //_target: 'head',
    //_format: data => ({
      //value: data.id,
      //text: data.name,
    //}),
  //},
  //location: {
    //point: {
      //lat: Types.number,
      //lng: Types.number,
    //},
    //zoom: {
      //_default: 10,
    //},
  //},
  dependencies: [{
    ...singleInstitution,
    _save: {
      create: data => parent => ({
        name: 'Save Dependency',
        request: Promise.resolve(data),
      }),
    },
  }],
  //opportunities: [opportunity],
  _save: {
    create: data => (parent, options) => ({
      name: 'Save Institution Data',
      request: fetch('http://localhost:3100/api/institutions/5b1cc66ace94c9ae6aefaeb6'),
    }),
    resultHandler: async (request) => {
      try {
        const response = await request
        if (response.ok) {
          const data = await response.json()
          return {
            result: data,
          }
        }
        return {
          error: 'something went wrong, reponse not ok',
        }
      } catch (error) {
        return {
          error,
        }
      }
    },
  },
}

const defaultFilter = {
  where: {
    adminLevel: 'main',
  },
  include: [
    { relation: 'head' },
    {
      relation: 'account',
    },
    {
      relation: 'logo',
    },
    {
      relation: 'opportunities',
      scope: {
        include: ['logo', 'account'],
      },
    },
    {
      relation: 'dependencies',
      scope: {
        include: [
          {
            relation: 'dependencies',
            scope: {
              include: [
                { relation: 'dependencies' },
                { relation: 'opportunities' },
              ],
            },
          },
          { relation: 'opportunities' },
        ],
      },
    },
  ],
}

const type2 = new TypeManager(institution)
console.log(type2.clear())

const type = new TypeManager(institution)
fetch(`http://localhost:3100/api/institutions/5b1cc66ace94c9ae6aefaeb6/?filter=${JSON.stringify(defaultFilter)}`)
.then(res => res.json())
.then((data) => {
// console.log(data)
  delete data.id
  const build = type.fill(data)
  console.log(build)
  const saveInfo = type.save(build)
  console.log(saveInfo)
  type.runSave(saveInfo, null).then(d => console.log(d))
})

let userInstance = null
getUserInstance().then(user => {
  userInstance = user
console.log(userInstance.restore())
})

