/**
 * Create the store with dynamic reducers
 */
import { valueOrDefault } from '@source4society/scepter-utility-lib';
import { createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import { routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducer';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(injectedInitialState, history) {
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
    module.hot.accept('./reducer', () => {
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
