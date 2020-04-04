# @dkh-dev/reduxify

_A redux toolkit for simple use cases_

> Inspired by [@reduxjs/toolkit](https://github.com/reduxjs/redux-toolkit).

> Why all these reinventing the wheel?
>
> [@reduxjs/toolkit](https://github.com/reduxjs/redux-toolkit) makes use of [immer](https://github.com/immerjs/immer), which isn't very useful when the project is relatively small. This utility instead encourages the use of setter-only action creators.  
> [@reduxjs/toolkit](https://github.com/reduxjs/redux-toolkit) also comes with default middlewares that cause poor performance when dispatching large objects (in development only, but still bad).

## Example

`redux/slice/profile.js`

```javascript
import { createSlice } from '@dkh-dev/reduxify'

const { slice, selectors, actions } = createSlice('profile', {
  name: null,
})

export default slice
export const { nameSelector } = selectors
export const { setName } = actions
```

`redux/store.js`

```javascript
import { configureStore } from '@dkh-dev/reduxify'
import thunk from 'redux-thunk'
import profile from './slice/profile'

const store = configureStore({
  slices: [ profile ],
  middlewares: [ thunk ],
})

export default store
```

`redux/actions.js`

```javascript
import api from '../api'
import { setName } from './slice/profile'

export const doLogIn = credential => async dispatch => {
  const user = await api('/login', credential)

  // on logged in
  dispatch(setName(user.name))
}
```

`components/profile.js`

```jsx
import React from 'react'
import { useSelector } from 'react-redux'
import { nameSelector } from '../redux/slice/profile'

const Profile = () => {
  const name = useSelector(nameSelector)

  return <p>Name: { name }</p>
}

export default Profile
```

`components/login.js`

```jsx
import React from 'react'
import { useDispatch } from 'react-redux'
import LoginForm from './login-form'
import { doLogIn } from '../redux/actions'

const Login = () => {
  const dispatch = useDispatch()

  const handleSubmit = (username, password) => {
    dispatch(doLogIn(username, password))
  }

  return <LoginForm onSubmit={ handleSubmit } />
}

export default Login
```
