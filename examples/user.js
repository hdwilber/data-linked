import { TypeManager, Types, MoreTypes } from '../src';

const PostSpec = {
  id: MoreTypes.id,
  header: {
    ...Types.string,
    _target: 'title',
    target: 'Something default',
  },
  text: {
    ...Types.string,
    _target: 'body',
  },
}

const UserSpec = {
  id: MoreTypes.id,
  name: 'Enter a name',
  email: Types.string,
  address: {
    street: Types.string,
    suite: Types.string,
    city: Types.string,
    zipcode: Types.string,
    location: {
      _target: 'geo',
      lat: Types.string,
      lng: Types.string,
    },
  },
  mobilePhone: {
    ...Types.string,
	_target: 'phone',
  },
  website: Types.string,
  company: {
    name: Types.string,
    catchPhrase: Types.string,
    bs: Types.string,
  },
  superPosts: [
    {
      ...PostSpec,
      _target: 'posts',
    }
  ],
  inlineDefaultString: 'Inline default',
  inlineDefaultNumber: 3.141592654,
}

const userUrl = 'https://jsonplaceholder.typicode.com/users/1'
const postsUrl = 'https://jsonplaceholder.typicode.com/posts?userId=1'

const userInstance = new TypeManager(UserSpec) 
async function getInstance() {
  const response = await fetch(userUrl)
  const userData = await response.json()
  const postsResponse = await fetch(postsUrl)
  const postsData = await postsResponse.json()
  console.log(userInstance.fill({...userData, posts: postsData}))
  return userInstance
}

export default getInstance
