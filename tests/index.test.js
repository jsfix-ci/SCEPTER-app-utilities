import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import { createReducer, configureStore, routeInitialState, routeReducer, prepareComposeEnhancers } from '../src/index';

test('routeReducer reduces the state of react router when routing', () => {
  const mockState = fromJS({ hasProperties: 'mockState' });
  const mockAction = { payload: 'mockPayload' };
  mockAction.type = LOCATION_CHANGE;
  let reducedState = routeReducer(mockState, mockAction);
  expect(reducedState.get('location')).toEqual(mockAction.payload);
  mockAction.type = 'notinreducer';
  reducedState = routeReducer(null, mockAction);
  expect(reducedState).toEqual(routeInitialState);
});

test('createReducer', () => {
  const mockInjectedReducers = {
    mockReducer: (state) => state,
  };
  const combinedReducers = createReducer(mockInjectedReducers);
  expect(typeof combinedReducers === 'function').toBeTruthy();
});

test('configureStore returns a store with middleware enhancements', () => {
  const mockInitialState = { };
  const mockHistory = { hasProperties: 'mockHistory' };
  const store = configureStore(mockInitialState, mockHistory);
  expect(store.getState).toBeDefined();
  expect(store.dispatch).toBeDefined();
  expect(store.subscribe).toBeDefined();
  expect(store.replaceReducer).toBeDefined();
});

test('prepareComposeEnhancers', () => {
  const mockHotReloadConfig = {
    shouldHotReload: false,
  };
  const window = {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: (config) => {
      expect(config).toEqual(mockHotReloadConfig);
    },
  };
  prepareComposeEnhancers(window);
});
