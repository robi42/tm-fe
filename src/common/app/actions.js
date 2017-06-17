// @flow
import { REHYDRATE } from 'redux-persist/constants';

export const APP_ERROR = 'APP_ERROR';
export const APP_ONLINE = 'APP_ONLINE';
export const APP_STARTED = 'APP_STARTED';

export const appError = (error: Object): Action => ({
  type: APP_ERROR,
  payload: { error },
});

export const appOnline = (online: boolean): Action => ({
  type: APP_ONLINE,
  payload: { online },
});

// Called on componentDidMount aka only at the client (browser or native).
export const appStart = (): SimpleAction => ({
  type: 'APP_START',
});

export const appStarted = (): SimpleAction => ({
  type: APP_STARTED,
});

export const appStop = (): SimpleAction => ({
  type: 'APP_STOP',
});

export const toggleBaseline = (): SimpleAction => ({
  type: 'TOGGLE_BASELINE',
});

export const setTheme = (theme: string): Action => ({
  type: 'SET_THEME',
  payload: { theme },
});

const appStartEpic = (action$: any) =>
  action$.ofType(REHYDRATE)
    .map(appStarted);

export const epics = [
  appStartEpic,
];
