// @flow
/* eslint-disable comma-dangle */
import { Record } from '../transit';
import {
  TOGGLE_MULTI_ACTION_DIALOG,
  TOGGLE_MULTI_ACTION_PROGRESS,
  TOGGLE_MISSING_DIALOG,
  TOGGLE_NORMALIZE_DIALOG,
  TOGGLE_UPLOAD_DIALOG,
  TOGGLE_UPLOAD_PROGRESS,
  TOGGLE_EXPORT_DIALOG,
  TOGGLE_MERGE_DIALOG
} from './actions';
/* eslint-enable comma-dangle */

type State = {
  isMultiActionDialogActive: boolean,
  isMultiActionInProgress: boolean,
  isMissingDialogActive: boolean,
  isNormalizeDialogActive: boolean,
  isMergeDialogActive: boolean,
  isExportDialogActive: boolean,
  isUploadDialogActive: boolean,
  isUploadInProgress: boolean,
  update: Function
};
const InitialState = Record({
  isMultiActionDialogActive: false,
  isMultiActionInProgress: false,
  isMissingDialogActive: false,
  isNormalizeDialogActive: false,
  isMergeDialogActive: false,
  isExportDialogActive: false,
  isUploadDialogActive: false,
  isUploadInProgress: false,
}, 'ui');

const uiReducer = (state: State = new InitialState(), action: Action): State => {
  switch (action.type) {
    case TOGGLE_MULTI_ACTION_DIALOG:
      return state.update('isMultiActionDialogActive', isActive => !isActive);

    case TOGGLE_MULTI_ACTION_PROGRESS:
      return state.update('isMultiActionInProgress', isInProgress => !isInProgress);

    case TOGGLE_MISSING_DIALOG:
      return state.update('isMissingDialogActive', isActive => !isActive);

    case TOGGLE_NORMALIZE_DIALOG:
      return state.update('isNormalizeDialogActive', isActive => !isActive);

    case TOGGLE_MERGE_DIALOG:
      return state.update('isMergeDialogActive', isActive => !isActive);

    case TOGGLE_EXPORT_DIALOG:
      return state.update('isExportDialogActive', isActive => !isActive);

    case TOGGLE_UPLOAD_DIALOG:
      return state.update('isUploadDialogActive', isActive => !isActive);

    case TOGGLE_UPLOAD_PROGRESS:
      return state.update('isUploadInProgress', isInProgress => !isInProgress);

    default:
      return state;
  }
};

export default uiReducer;
