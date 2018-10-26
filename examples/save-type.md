## Gallery of examples:

### Requesting to store type
Create, parse and format are only one step in the management of the types. The storage and saving requests can be done by setting up the next spec field: `_save`.
The saving or requesting stage comprises 2 steps:
1. Prepare all the information necessary to send a request.
2. Run and send the request.

### Setting up the saving field `_save`
When a `_save` field exists in a type specification regarding to its object, the object will require all data fields described inside in order to start the saving process.
Basically, the saving process per any `sendable` object can be achieved in synchronous or asynchronous way.
The `_save` field spec has an inner property: `create` can be a standalone or an array of functions.
If it is an standalone function, it will be executed after its parent is completed. However, in an array of functions, it is possible to set `isSync` boolean value. When `isSync = true`, a query will be started after the previuos one has returned. The order is determined by the array list.
This is useful when we need to test something before to start saving.
When `isSync = false`, all queries specified in the array will start at *same time*
The `_save` spec field has the following structure:
```
  *create*: function or Array of functions that returns another function to exec. 
  If returns null, the action is stopped. The first function will receive only data that is going to be stored.
  The second function will receive all data regarding to the response of the request and data from its siblings. If the first function has been executed and it is synchronous, the response of the previous request will be stored and available for the next request.

  *isSync*: boolean value to run requests in the `create` function or array of functions,

  *as*: this is the opposite to `_target` spec field, it will set the name of its parent object.
  *format*: The same than `_format` spec field, but in this case, the returning data will be set inside the object data 

```

Let's suppose we have this spec again, with saving fields:
```
const userSpec = {
  name: Types.string,
  birthYear: {
    ...Types.number,
    _default: 2000,
    _format: (age) => {
      // calculate the birth year according to its current age
    }
    _target: 'age'
    _save: {
      as: 'some-year',
    }
  }
  phones: [Types.string],
  posts: [{
    ...PostSpec,
    _target: 'postData',
    _save: {
      create: data => (parent, options) => {
        return {
          name: 'standalone saving for post',
          request: Promise.resolve('Posts saved')
        }
      })
    }
  }]
  _save: {
    isSync: true,
    create: [
      data => (parent, options) => {
        // Check whatever we need to do.
        // If we continue with saving. The return object should have a `request` field
        return {
          name: 'Check action',
          request: Promise.resolve('Good to go')
        }
      },
      data => (parent, options) => {
        return {
          name: 'Do save', 
          request: Promise.resolve('Saved')
        }
      }
    ]
  }
}
```


Regarding to create the saving information, the above specification means: 
User will have:
  - The userSpec makes it `savable`
  - a `name` field that will be saved with the same name in its container object,
  - a `birthYear` field that will be saved as `some-year` in its container object.  
  - a `posts` field with `PostSpec` specification that is savable, too. It will create an standalone function to build its request.
  - An object with this userSpec will be saved in two steps synchronously(array in the `create` field). The first request will `check action` and the next will `do save`

So, the output data at the top level of user object will be:
```
const outputData = {
  name: 'Wilber',
  'some-year': 30,
  'phones': [],
}
```
The `posts` property will be called with the following properties by running its saving function:
```
const post = {
  text: 'bla bla',
  title: 'bla bla',
}
```
Since, the posts field is an array, the request will be executed per every single post independently

The output after running: `userInstanceType.save(userInfo)` will be a metainformation and data about how to process the requests. This output is a parameter to finally run with `userInstanceType.runSave(savingInfo)`.

Somethings to consider:
- Do not forget that `_save` spec will make the object to work independently. All fields in the object scope will be added as data to send with the request.
- In the case of user Object, the properties to send are: name, 'some-year' and phones, because they belongs to the same level where its `_save` spec field is defined.
- In the case of the Post spec, the properties in the scope coud be: header, text and id.
- Only fields with `_save` will work as an sendable object. So, it is possible to have an object with nested properties and behave like a single value.
- The `create` field in `_save` will always be a function or array of functions. It should always return another function where the `request` Promise can be created. If the function returns null, nothing will be executed.


