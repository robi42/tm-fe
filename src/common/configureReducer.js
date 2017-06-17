// @flow weak
import app from './app/reducer';
import config from './config/reducer';
import device from './device/reducer';
import entries from './entries/reducer';
import intl from './intl/reducer';
import ui from './ui/reducer';
import { combineReducers } from 'redux';
import { fieldsReducer as fields } from './lib/redux-fields';

const configureReducer = () => combineReducers({
  app,
  config,
  device,
  entries,
  fields,
  intl,
  ui,
});

export default configureReducer;
