'use strict'

const test = require('tape')
const { default: thunk } = require('redux-thunk')

const { createSlice, configureStore, combineSlices } = require('..')


// routes
const HOME = '/'
const PROFILE = '/profile'
// user
const NAME = '@dkh-dev/reduxie'


test('store without middlewares', t => {
  // slice/router.js
  const {
    slice: router,
    actions: { setRoute },
    selectors: { getRoute },
  } = createSlice('router', { route: HOME })

  // slice/profile.js
  const {
    slice: profile,
    actions: { setName },
    selectors: { getName },
  } = createSlice('profile', { name: null })

  const { getState, dispatch } = configureStore({
    slices: [ router, profile ],
  })


  t.equal(getRoute(getState()), HOME)
  t.equal(getName(getState()), null)

  // on user logged in
  dispatch(setRoute(PROFILE))
  dispatch(setName(NAME))

  t.equal(getRoute(getState()), PROFILE)
  t.equal(getName(getState()), NAME)

  t.end()
})

test('store with redux-thunk', t => {
  const {
    slice,
    actions: { setRoute },
    selectors: { getRoute },
  } = createSlice('router', { route: HOME })

  const { getState, dispatch } = configureStore({
    slices: [ slice ],
    middlewares: [ thunk ],
  })

  const login = credentials => dispatch => {
    // await verify(credentials)
    t.ok(credentials)

    // on successful login, navigate to profile page
    dispatch(setRoute(PROFILE))
  }

  t.equal(getRoute(getState()), HOME)

  dispatch(login('username:password'))

  t.equal(getRoute(getState()), PROFILE)

  t.end()
})

test('replacing reducer', t => {
  const {
    slice: router,
    actions: { setRoute },
    selectors: { getRoute },
  } = createSlice('router', { route: HOME })
  const {
    slice: profile,
    selectors: { getName },
  } = createSlice('profile', { name: NAME })

  const {
    getState,
    dispatch,
    replaceReducer,
  } = configureStore({ slices: [ router ] })

  t.equal(getRoute(getState()), HOME)
  t.equal(getName(getState()), void 0, `slice profile hasn't been added to the store`)

  replaceReducer(combineSlices([ router, profile ]))

  dispatch(setRoute(PROFILE))

  t.equal(getRoute(getState()), PROFILE)
  t.equal(getName(getState()), NAME, `slice profile has just been added to the store`)

  t.end()
})
