'use strict'

/* eslint-disable max-statements */

const test = require('tape')
const { default: thunk } = require('redux-thunk')

const { createSlice, configureStore } = require('..')


const ROUTE = {
  home: '/',
  profile: '/profile',
}
const NAME = '@dkh-dev/reduxify'

test('store without middlewares', t => {
  // slice/router.js
  const router = createSlice('router', {
    route: ROUTE.home,
  })
  const routerSlice = router.slice
  const { setRoute } = router.actions
  const { routeSelector } = router.selectors

  // slice/profile.js
  const profile = createSlice('profile', {
    name: null,
  })
  const profileSlice = profile.slice
  const { setName } = profile.actions
  const { nameSelector } = profile.selectors

  const { getState, dispatch } = configureStore({
    slices: [ routerSlice, profileSlice ],
  })

  t.equal(routeSelector(getState()), ROUTE.home)
  t.equal(nameSelector(getState()), null)

  // on user logged in
  dispatch(setRoute(ROUTE.profile))
  dispatch(setName(NAME))

  t.equal(routeSelector(getState()), ROUTE.profile)
  t.equal(nameSelector(getState()), NAME)

  t.end()
})

test('store with redux-thunk', t => {
  const { slice, actions, selectors } = createSlice('router', {
    route: ROUTE.home,
  })
  const { setRoute } = actions
  const { routeSelector } = selectors

  const { getState, dispatch } = configureStore({
    slices: [ slice ],
    middlewares: [ thunk ],
  })

  const doLogin = credentials => dispatch => {
    // await login(credentials)
    t.ok(credentials)

    // on successful login, navigate to profile page
    dispatch(setRoute(ROUTE.profile))
  }

  t.equal(routeSelector(getState()), ROUTE.home)

  dispatch(doLogin('username:password'))

  t.equal(routeSelector(getState()), ROUTE.profile)

  t.end()
})
