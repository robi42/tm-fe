// @flow weak
import { createTransform } from 'redux-persist';
import { pick } from 'ramda';

// TODO: Add redux-persist-migrate.

const paths = [
  ['fields'],
  ['intl', ['currentLocale']],
];

const transforms = [];
const whitelist = [];

// Paths always override the initialState, because upcoming service workers.
// Paths are explicit, because upcoming migration.
paths.forEach(([feature, props]) => {
  whitelist.push(feature);
  if (!props) return;
  const inOut = state => pick(props, state);
  transforms.push(createTransform(inOut, inOut, { whitelist: [feature] }));
});

const configureStorage = (appName, storage) => ({
  debounce: 100,
  keyPrefix: `${appName}:`,
  storage,
  transforms,
  whitelist,
});

export default configureStorage;
