'use strict'

const { combineReducers, createStore, applyMiddleware } = require('redux')


const capitalize = string => string[ 0 ].toUpperCase() + string.slice(1)

const composeWithVoid = enhancer => enhancer

/**
 * @type {function}
 */
const composeWithDevTools = (
  typeof window !== 'undefined'
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || composeWithVoid
    : composeWithVoid
)

const createActionCreator = type => payload => ({ type, payload })

/**
 * Creates an action type and setter-only action creator for each of the keys in
 *   `initialState`.
 * @param {string} sliceName
 * @param {object} initialState
 */
const createActionCreators = (sliceName, initialState) => {
  // action creator names
  const names = Object.keys(initialState).map(key => `set${ capitalize(key) }`)
  // action types
  const types = names.map(name => `${ sliceName }/${ name }`)

  const actions = Object.fromEntries(names.map((name, index) => [
    name,
    createActionCreator(types[ index ]),
  ]))

  return {
    types,
    actions,
  }
}

/**
 * Create a selector for each of the keys in `initialState`.
 * @param {string} sliceName
 * @param {object} initialState
 */
const createSelectors = (sliceName, initialState) => Object.fromEntries(
  Object.keys(initialState).map(key => [
    `${ key }Selector`,
    state => state[ sliceName ][ key ],
  ]),
)

/**
 * Create a reducer from action `types` and `initialState`.
 * Notice: `types` and `initialState` keys must be in a same iteration order.
 * @param {string[]} types
 * @param {object} initialState
 */
const createReducer = (types, initialState) => {
  const reducers = Object.fromEntries(
    Object.entries(initialState).map(([ key, initialValue ], index) => {
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
  const { types, actions } = createActionCreators(sliceName, initialState)
  const selectors = createSelectors(sliceName, initialState)
  const reducer = createReducer(types, initialState)
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

  return createStore(reducer, composeWithDevTools(enhancer))
}

module.exports = {
  createActionCreators,
  createSelectors,
  createReducer,
  createSlice,
  combineSlices,
  configureStore,
}
