import configureStore, { prepareComposeEnhancers } from '../configureStore';

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
