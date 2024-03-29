// @flow
import type { ConfigState } from '../types';

const initialState = {
  appName: '',
  appVersion: '',
};

const reducer = (
  state: ConfigState = initialState,
): ConfigState => state;

export default reducer;
