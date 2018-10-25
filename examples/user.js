import { TypeManager, Types, MoreTypes } from '../src';

const PostSpec = {
  id: MoreTypes.id,
  title: Types.string,
  body: Types.string,
}

const UserSpec = {
  id: MoreTypes.id,
  fullname: {
	...Types.string,
	_target: 'name',
  },
  email: Types.string,
  address: {
    street: Types.string,
    suite: Types.string,
    city: Types.string,
    zipcode: Types.string,
    geo: {
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
  posts: [PostSpec],
}

const userUrl = 'https://jsonplaceholder.typicode.com/users/1'
const postsUrl = 'https://jsonplaceholder.typicode.com/posts?userId=1'

const userInstance = new TypeManager(UserSpec) 
async function getInstance() {
  const response = await fetch(userUrl)
  const userData = await response.json()
  const postsResponse = await fetch(postsUrl)
  const postsData = await postsResponse.json()
  userInstance.fill({...userData, posts: postsData})
  return userInstance
}

export default getInstance
