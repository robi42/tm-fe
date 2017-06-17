// @flow
/* eslint-disable comma-dangle */
import React from 'react';
import Dialog from 'react-toolbox/lib/dialog';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { toggleMergeDialog, toggleMultiActionProgress } from '../../common/ui/actions';
import styles from '../lib/commons.scss';
import {
  FIRST_PAGE,
  setCurrentPage,
  setPageSize,
  setSearchFilter,
  setSelectedIds,
  setSelectedNormalizeBar,
  setOutliersFiltered,
  setSortedBy,
  fetchSchema,
  fetchEntries,
  postMerge
} from '../../common/entries/actions';
import { DEFAULT_PAGE_SIZE } from '../../common/entries/reducer';
import { Durations } from '../../common/lib/utils';
/* eslint-enable comma-dangle */

type Props = {
  isActive: boolean,
  isMultiActionInProgress: boolean,
  sourceField: ?string,
  targetField: ?string,
  schema: Map<string, string>,
  toggleMergeDialog: Function,
  toggleMultiActionProgress: Function,
  setCurrentPage: Function,
  setPageSize: Function,
  setSearchFilter: Function,
  setSelectedIds: Function,
  setSelectedNormalizeBar: Function,
  setOutliersFiltered: Function,
  setSortedBy: Function,
  postMerge: Function,
  fetchSchema: Function,
  fetchEntries: Function,
};

const { ONE_SECOND_AS_MILLIS: ONE_SECOND } = Durations;

export class MergeDialog extends React.Component {

  props: Props;

  async handleOkClick() {
    const {
      sourceField,
      targetField,
      toggleMultiActionProgress,
      setCurrentPage,
      setPageSize,
      setSearchFilter,
      setSelectedIds,
      setSelectedNormalizeBar,
      setOutliersFiltered,
      setSortedBy,
      postMerge,
      fetchSchema,
      fetchEntries,
      toggleMergeDialog,
    } = this.props;

    toggleMultiActionProgress();

    await postMerge(sourceField, targetField);

    setCurrentPage(FIRST_PAGE);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSearchFilter('');
    setSortedBy('');
    setSelectedIds([]);
    setOutliersFiltered(false);
    setSelectedNormalizeBar(null);

    // @formatter:off
    setTimeout(async () => { // @formatter:on
      await fetchSchema();
      await fetchEntries(this.props.schema);

      toggleMergeDialog();
      toggleMultiActionProgress();
    }, ONE_SECOND); // Let ES refresh.
  }

  handleDialogToggle() {
    const { isMultiActionInProgress, toggleMergeDialog } = this.props;

    if (!isMultiActionInProgress) {
      toggleMergeDialog();
    }
  }

  render() {
    const { isActive, isMultiActionInProgress, sourceField, targetField } = this.props;

    return (
      <Dialog
        actions={[
          {
            label: 'OK',
            onClick: () => this.handleOkClick(),
            disabled: isMultiActionInProgress,
          },
          {
            label: 'Cancel',
            onClick: () => this.handleDialogToggle(),
            disabled: isMultiActionInProgress,
          },
        ]}
        active={isActive}
        onEscKeyDown={() => this.handleDialogToggle()}
        onOverlayClick={() => this.handleDialogToggle()}
        title="Merge?"
        type="small"
      >
        <p>
          <em><strong>{sourceField}</strong></em> with <em><strong>{targetField}</strong></em>
        </p>
        <ProgressBar className={isMultiActionInProgress ? '' : styles.hidden} />
      </Dialog>
    );
  }

}

export default connect(state => ({
  isActive: state.ui.isMergeDialogActive,
  isMultiActionInProgress: state.ui.isMultiActionInProgress,
  sourceField: state.entries.mergeSourceField,
  targetField: state.entries.mergeTargetField,
  schema: state.entries.schema,
}), {
  toggleMergeDialog,
  toggleMultiActionProgress,
  setCurrentPage,
  setPageSize,
  setSearchFilter,
  setSelectedIds,
  setSelectedNormalizeBar,
  setOutliersFiltered,
  setSortedBy,
  fetchSchema,
  fetchEntries,
  postMerge,
})(MergeDialog);
