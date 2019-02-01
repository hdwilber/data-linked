# data-linked
A really small library to handle objects by clearing, formatting and even saving.

## Some background
When I started to write my personal applications, I saw that normally my data sources were not formatted as I expected, or format changed according to different requirements. I had to write and parse the data to convert into the required format to build my objects. Sometimes, I needed to set default values by hand when the data was not available yet and a lot of undefined values warnings were displayed. Also, sometimes I made typos in my objects and problems emerged.
Basically, this is my main concern to write this small library.

## How to use
Sorry, currently it is not registered at npm. Because I think this still needs some(a lot of) improvements. If you really want to use, you can link it to your project with
```
npm install git+https://github.com/hdwilber/data-linked.git
```
I hope someday this small project could be raised into npm.

- Please, see how [to create an object type](https://github.com/hdwilber/data-linked/blob/master/examples/create-type.md),
- To know more about [saving specifications](https://github.com/hdwilber/data-linked/blob/master/examples/save-type.md).
- Also, you can see the code described in the small documentation, [user.js](https://github.com/hdwilber/data-linked/blob/master/examples/user.js) or if you want some more complex objects specifications at [example.js](https://github.com/hdwilber/data-linked/blob/master/examples/example.js)


## Dev mode
This small project is open to receive collaborations, improvements, suggestions, criticisms, feedback, naming suggestions(I hate to name things) or whatever you want. If there are some ones, I will be happy to know about them.
If you want to start a dev mode:
```
npm run dev
```
This script will start webpack dev server and load the file `/examples/example.js` displaying the output the data example.

### I hate to name anything
Please, if you could help me to name all variables and functions we have here or even repository name it would be awesome.

## License
MIT License
