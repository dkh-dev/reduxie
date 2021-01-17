'use strict'

const { combineReducers, createStore, applyMiddleware } = require('redux')


const capitalize = string => string[ 0 ].toUpperCase() + string.slice(1)

const compose = enhancer => {
  const compose = typeof window !== 'undefined'
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : null

  if (!compose) {
    return enhancer
  }

  return enhancer ? compose(enhancer) : compose()
}


const createActionCreator = type => payload => ({ type, payload })

/**
 * Creates an action type and setter-only action creator for each of the keys
 *   of the slice.
 * @param {string} sliceName
 * @param {string[]} keys
 */
const createActionCreators = (sliceName, keys) => {
  // action creator names
  const names = keys.map(key => `set${ capitalize(key) }`)
  // action types
  const types = names.map(name => `${ sliceName }/${ name }`)

  const actions = Object.fromEntries(
    names.map((name, index) => [
      name,
      createActionCreator(types[ index ]),
    ]),
  )

  return {
    types,
    actions,
  }
}

/**
 * Create a selector for each of the keys of the slice.
 * @param {string} sliceName
 * @param {string[]} keys
 */
const createSelectors = (sliceName, keys) => Object.fromEntries(
  keys.map(key => [
    `get${ capitalize(key) }`,
    state => {
      const sliceValue = state[ sliceName ]

      return sliceValue ? sliceValue[ key ] : void 0
    },
  ]),
)

/**
 * Create a reducer from entries of the slice's initial state and their
 *   corresponding setter action types.
 * @param {array[]} entries
 * @param {string[]} types
 */
const createReducer = (entries, types) => {
  const reducers = Object.fromEntries(
    entries.map(([ key, initialValue ], index) => {
      const type = types[ index ]

      return [
        key,
        (state = initialValue, action) => (
          action.type === type ? action.payload : state
        ),
      ]
    }),
  )

  return combineReducers(reducers)
}

/**
 * Creates a reducer slice, action creators and selectors.
 * @param {string} sliceName
 * @param {object} initialState
 */
const createSlice = (sliceName, initialState) => {
  const keys = Object.keys(initialState)
  const entries = Object.entries(initialState)

  const { types, actions } = createActionCreators(sliceName, keys)
  const selectors = createSelectors(sliceName, keys)
  const reducer = createReducer(entries, types)
  const slice = { [ sliceName ]: reducer }

  return {
    types,
    actions,
    selectors,
    reducer,
    slice,
  }
}

/**
 * Combine reducer slices into a root reducer.
 * @param {object[]} slices
 */
const combineSlices = slices => {
  const reducers = Object.assign({}, ...slices)

  return combineReducers(reducers)
}

const configureStore = ({ slices, middlewares }) => {
  const reducer = combineSlices(slices)
  const enhancer = middlewares ? applyMiddleware(...middlewares) : void 0

  return createStore(reducer, compose(enhancer))
}

module.exports = {
  createSlice,
  combineSlices,
  configureStore,
}
