/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from 'redux-immutable';
import { fromJS } from 'immutable';
import { routerMiddleware, LOCATION_CHANGE } from 'react-router-redux';
import { valueOrDefault } from '@source4society/scepter-utility-lib';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to react-router-redux@4
 *
 */

// Initial routing state
export const routeInitialState = fromJS({
  location: null,
});

/**
 * Merge route into the global application state
 */
export function routeReducer(injectedState, action) {
  const state = valueOrDefault(injectedState, routeInitialState);
  switch (action.type) {
    /* istanbul ignore next */
    case LOCATION_CHANGE:
      return state.merge({
        location: action.payload,
      });
    default:
      return state;
  }
}

/**
 * Creates the main reducer with the dynamically injected ones
 */
export function createReducer(injectedReducers) {
  return combineReducers({
    route: routeReducer,
    ...injectedReducers,
  });
}

const sagaMiddleware = createSagaMiddleware();

export function configureStore(injectedInitialState, history) {
  const initialState = valueOrDefault(injectedInitialState, {});
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [
    sagaMiddleware,
    routerMiddleware(history),
  ];

  const enhancers = [
    applyMiddleware(...middlewares),
  ];
  const composeEnhancers = prepareComposeEnhancers();
  const store = createStore(
    createReducer(),
    fromJS(initialState),
    composeEnhancers(...enhancers)
  );

  // Extensions
  store.runSaga = sagaMiddleware.run;
  store.injectedReducers = {}; // Reducer registry
  store.injectedSagas = {}; // Saga registry

  const enhancedStore = enableHotReloading(store);
  return enhancedStore;
}

export const enableHotReloading = (store) => {
  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('@source4society/scepter-app-utilities', () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });
  }
  return store;
};

export const prepareComposeEnhancers = (injectedWindow) => {
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  const window = valueOrDefault(injectedWindow, window);
  /* eslint-disable no-underscore-dangle */
  if (
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ) {
    // TODO Try to remove when `react-router-redux` is out of beta, LOCATION_CHANGE should not be fired more than once after hot reloading
    // Prevent recomputing reducers for `replaceReducer`
    return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      shouldHotReload: false,
    });
  }
  /* eslint-enable */
  return compose;
};
