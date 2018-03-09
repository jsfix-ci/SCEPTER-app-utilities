import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import createReducer, { routeInitialState, routeReducer } from '../reducer';

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
