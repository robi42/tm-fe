// @flow
import { defineMessages } from 'react-intl';
import { ValidationError } from '../lib/validation';

const errorMessages = defineMessages({
  // TODO: add messages.
});

const validationErrorToMessage = error => ({
  message: errorMessages[error.name] || error.name,
  values: error.params,
});

// Because app validations can be reused at many UI places, we have one common
// errorToMessage helper function. In React Native, it's used for global alert.
const errorToMessage = (error: Object) => {
  // Note all app validation errors are mapped to UI messages here.
  // With such design, the app can have a lot of various different components,
  // and it's not a component responsibility to project an error to UI.
  if (error instanceof ValidationError) {
    return validationErrorToMessage(error);
  }
  return null;
};

export default errorToMessage;
