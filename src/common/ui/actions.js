// @flow
export const TOGGLE_MULTI_ACTION_DIALOG = 'TOGGLE_MULTI_ACTION_DIALOG';
export const TOGGLE_MULTI_ACTION_PROGRESS = 'TOGGLE_MULTI_ACTION_PROGRESS';
export const TOGGLE_MISSING_DIALOG = 'TOGGLE_MISSING_DIALOG';
export const TOGGLE_NORMALIZE_DIALOG = 'TOGGLE_NORMALIZE_DIALOG';
export const TOGGLE_MERGE_DIALOG = 'TOGGLE_MERGE_DIALOG';
export const TOGGLE_EXPORT_DIALOG = 'TOGGLE_EXPORT_DIALOG';
export const TOGGLE_UPLOAD_DIALOG = 'TOGGLE_UPLOAD_DIALOG';
export const TOGGLE_UPLOAD_PROGRESS = 'TOGGLE_UPLOAD_PROGRESS';

type Action = {
  type: 'TOGGLE_MULTI_ACTION_DIALOG' |
    'TOGGLE_MULTI_ACTION_PROGRESS' |
    'TOGGLE_MISSING_DIALOG' |
    'TOGGLE_NORMALIZE_DIALOG' |
    'TOGGLE_EXPORT_DIALOG' |
    'TOGGLE_MERGE_DIALOG' |
    'TOGGLE_UPLOAD_DIALOG' |
    'TOGGLE_UPLOAD_PROGRESS'
};

const toggleMultiActionDialog = (): Action => ({ type: TOGGLE_MULTI_ACTION_DIALOG });

const toggleMultiActionProgress = (): Action => ({ type: TOGGLE_MULTI_ACTION_PROGRESS });

const toggleMissingDialog = (): Action => ({ type: TOGGLE_MISSING_DIALOG });

const toggleNormalizeDialog = (): Action => ({ type: TOGGLE_NORMALIZE_DIALOG });

const toggleMergeDialog = (): Action => ({ type: TOGGLE_MERGE_DIALOG });

const toggleExportDialog = (): Action => ({ type: TOGGLE_EXPORT_DIALOG });

const toggleUploadDialog = (): Action => ({ type: TOGGLE_UPLOAD_DIALOG });

const toggleUploadProgress = (): Action => ({ type: TOGGLE_UPLOAD_PROGRESS });

export {
  toggleMultiActionDialog,
  toggleMultiActionProgress,
  toggleMissingDialog,
  toggleNormalizeDialog,
  toggleMergeDialog,
  toggleExportDialog,
  toggleUploadDialog,
  toggleUploadProgress,
};
