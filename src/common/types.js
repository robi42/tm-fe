// @flow

// Algebraic types are composable, so it makes sense to have them at one place.
// blog.ploeh.dk/2016/11/28/easy-domain-modelling-with-types

// Core

export type Deps = {
  getState: () => Object,
  getUid: () => string,
  now: () => number,
  validate: (json: Object) => any,
};

// Models

// Reducers
// We can't use exact object type, because spread is not supported yet.
// We can't use Strict<T> = T & $Shape<T>, because it breaks autocomplete.
// TODO: Wait for Flow.

export type AppState = {
  baselineShown?: boolean,
  currentTheme?: string,
  error: ?Error,
  online: boolean,
  started: boolean,
};

export type ConfigState = {
  appName: string,
  appVersion: string,
};

export type DeviceState = {
  host: string,
  isReactNative: boolean,
  platform: string,
};

export type IntlState = {
  currentLocale: ?string,
  defaultLocale: ?string,
  initialNow: ?number,
  locales: ?Array<string>,
  messages: ?Object,
};

// State

export type State = {
  app: AppState,
  config: ConfigState,
  device: DeviceState,
  fields: any,
  intl: IntlState,
};

// Actions

export type Action =
  { type: 'APP_ERROR', payload: { error: Error } }
    | { type: 'APP_ONLINE', payload: { online: boolean } }
    | { type: 'APP_SHOW_MENU', payload: { menuShown: boolean } }
    | { type: 'APP_START' }
    | { type: 'APP_STARTED' }
    | { type: 'APP_STOP' }
    | { type: 'APP_STORAGE_LOADED' }
    | { type: 'SET_CURRENT_LOCALE', payload: { locale: string } }
  ;
