// @flow
import { APP_ERROR, APP_ONLINE, APP_STARTED } from './actions';
import { Record } from '../transit';

type State = {
  error: ?string,
  online: boolean,
  started: boolean,
  loading: boolean,
  set: Function,
};
const InitialState = Record({
  error: null,
  online: false,
  started: false,
  loading: true,
}, 'app');

const KEY_ERROR = 'error';
const KEY_LOADING = 'loading';

const isServerFetch = actionType => (
  actionType.startsWith('FETCH_') ||
  actionType.startsWith('UPLOAD_') ||
  actionType.startsWith('UPDATE_') ||
  actionType.startsWith('DELETE_')
);

const appReducer = (state: State = new InitialState(), action: Action): State => {
  const actionType = action.type;

  if (actionType.endsWith('_FAIL') || actionType.endsWith('_ERROR')) {
    state = state
      .set(KEY_ERROR, action.payload.message)
      .set(KEY_LOADING, false);
  }
  if (isServerFetch(actionType) && actionType.endsWith('_START')) {
    state = state.set(KEY_LOADING, true);
  }
  if (isServerFetch(actionType) && actionType.endsWith('_SUCCESS')) {
    state = state.set(KEY_LOADING, false);
  }

  switch (actionType) {
    case APP_ERROR:
      return state.set(KEY_ERROR, action.payload.message);

    case APP_ONLINE:
      return state.set('online', action.payload.online);

    case APP_STARTED:
      return state
        .set(KEY_LOADING, false)
        .set('started', true);

    default:
      return state;
  }
};

export default appReducer;
