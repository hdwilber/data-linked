## Gallery of examples:

### Creating a new type
In order to write types specifications, it is important to say that every field that starts with: `_`(underscore) is considered a `settings field` for its corresponding type.  Once the implementation is getting mature, I think we are going to be able to distinguish what fields with underscore are allowed or not. Please, take care of it.

Suppose we are wanting to have a user type, we can make its specification by this way:
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
  }
  phones: [Types.string],
  posts: [{
    ...PostSpec,
    _target: 'postData',
  }]
}
```
The above specification means: 
User will have:
  - a name of string type with empty as default
  - a birthYear field that:
    - will be formatted according to the `age` field in the target object.
    - if there is not a value there, set as default(`_default`) will be `2000`
    - The data is taken from `age` field and set into `birthYear`
  - a phones field that is an Array and by defauly an empty one `[]`.
  - a posts field that is an array and the data will be retrieved from 'postData' field `_target`

According to that specification, the input data can have any of these fields. If the data doesn't have any of them or is empty, the output will create an object populated by default values.

Let's suppose we have the next object as input data:
```
const inputData = {
  name: 'Wilber',
  age: 30,
  postData: [
    {
      text: 'bla bla',
      title: 'bla bla',
    }
  ]
}
```

We need to create an instance of the type with its specification, so:
```
const userInstanceType = new TypeManager(userSpec)
```
To create an empty object with user type specification, call the `clean()` method:
```
const emptyUserObject = userInstanceType.clear()
```
`fill()` method is used to populate it with input data:
```
This method will result an object like this:
```
const output = {
  name: '',
  birthYear: 1988,
  phones: [],
  posts: [],
}
```

const filledUserObject = userInstanceType.fill(inputData)
```
And the output will be: 
```
const output = {
  name: 'Wilber',
  birthYear: 1988,
  phones: [],
  posts: [{ text: 'bla bla', title: 'bla bla'}],
}
```

Then you can work with output data or the empty object if you want.
Somethings to consider:
- Do not forget that the an field spec that is intended to be an array, should have a type spec at first element.
- You can nest / link anything together resulting a complex object.
- `_default` and `_format` can be values or functions. If a function is declared, in `_format` The data target will be the first parameter. 
  Whatever it returns, the data will be passed to the field.

