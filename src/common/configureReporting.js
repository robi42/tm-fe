// @flow weak

const captureException = error => {
  if (process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    console.warn('Uncaught error. Fix it.');
    // github.com/redux-observable/redux-observable/issues/10#issuecomment-235431202
    if (error.stack) console.error(error.stack);
    /* eslint-enable no-console */
  }
};

const reportingMiddleware = () => next => action => {
  // strings, because hot reloading (ok, because circular references)
  if (action.type === 'APP_ERROR') {
    captureException(action.payload.error);
  }
  return next(action);
};

// bluebirdjs.com/docs/api/error-management-configuration.html#global-rejection-events
const register = unhandledRejection => unhandledRejection(event => {
  event.preventDefault();
  // http://bluebirdjs.com/docs/api/error-management-configuration.html
  captureException(event.detail.reason);
});

const configureReporting = options => {
  const { unhandledRejection } = options;
  register(unhandledRejection);
  return reportingMiddleware;
};

export default configureReporting;
