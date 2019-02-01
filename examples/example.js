import getUserInstance from './user'

// Other examples
// sample institution spec
const singleInstitution = {
  id: MoreTypes.id,
  prename: Types.string,
  name: Types.string,
  isValid: Types.bool,
  phones: [Types.string],
}

// sample Opportunity spec with requests
// Saving a logo with two Promises to resolve.
// Create property in _save is an array.
const opportunity = {
  id: MoreTypes.id,
  name: Types.string,
  logo: {
    ...MoreTypes.image,
    _save: {
      create: [
        (data, current) => {
          return (parent, options) => ({
            name: 'Create Logo in Opportunity',
            request: Promise.resolve('Create Logo Request'),
          })
        },
        (data, current) => (parent, options) => ({
          name: 'Create Logo in Opportunity #2',
          request: Promise.resolve('Create Logo Request #2'),
        }),
      ],
    },
  },
  // create property in _save is a function
  _save: {
    create: (data, current) => (parent, options) => ({
      name: 'Single Saving Request',
      request: Promise.resolve('Single Request'),
    }),
  },
  _findInArray: function (data, array) {
    return array.find(d => d.id === data.id)
  },
}

// Reusing institution spec defined before
const institution = {
  ...singleInstitution,
  logo: {
    ...MoreTypes.image,
    _save: {
      // Before to start to create the save instance, there an option to continue
      checkBeforeCreate: function (newValues, current) {
        // On false, saving process is stopped
        return false
      },
      // If synchronized. requests are executed one by one according to create array. Otherwise, all are executed at same time
      isSync: true,
      create: [
        data => (data, ref) => {
          return {
            name: 'First request to execute',
            request: getTimer(2000),
          }
        },
        data => (data, ref) => {
          return {
            name: 'Second request to execute',
            request: getTimer(2000),
          }
        },
      ],
    },
  },
  // array of institutions
  dependencies: [{
    ...singleInstitution,
    _save: {
      create: data => parent => ({
        name: 'Save as a dependency',
        request: Promise.resolve(data),
      }),
    },
  }],
  // array of opportunities defined before
  opportunities: [opportunity],
  _save: {
    create: (data, current) => {
      return (parent, options) => ({
        name: 'Request',
        request: Promise.resolve('Data is going to be saved')
      })
    },
    // It is possible to parse the request result
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
          error: 'Something went wrong, reponse not ok',
        }
      } catch (error) {
        return {
          error,
        }
      }
    },
  },
}

// You can use the simplest specification for institution
const simplestInstitutionType = new TypeManager(singleInstitution)
// You can use it with all complete Institution specification
const institutionType = new TypeManager(institution)
// You can use only parts of it. For example. only logo

// Testing the user example
getUserInstance().then(user => {
  // user the formatted one:
  const formattedUser = user
})

