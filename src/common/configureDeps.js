// @flow weak
import createFetch from './createFetch';
import validate from './validate';
import { serverUrl } from './lib/utils';

const createUniversalFetch = () => createFetch(serverUrl());

const configureDeps = (initialState, platformDeps) => ({
  ...platformDeps,
  fetch: createUniversalFetch(),
  getUid: () => platformDeps.uuid.v4(),
  now: () => Date.now(),
  validate,
});

export default configureDeps;
