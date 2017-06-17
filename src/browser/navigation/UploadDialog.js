// @flow
/* eslint-disable comma-dangle */
import Dialog from 'react-toolbox/lib/dialog';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import React from 'react';
import { connect } from 'react-redux';
import { List, Map, Set } from 'immutable';
import { Durations } from '../../common/lib/utils';
import styles from './UploadDialog.scss';
import { CHART_PAGE_PATH } from '../app/App';
import {
  FIRST_PAGE,
  DEFAULT_DATE_HISTOGRAM_INTERVAL,
  getUploadData,
  uploadCsv,
  setCurrentPage,
  setPageSize,
  setSearchFilter,
  setSortedBy,
  fetchSchema,
  fetchEntries,
  fetchAggs,
  fetchDateHistogram,
  setSelectedNormalizeBar,
  setSelectedIds,
  setOutlierIds,
  setOutliersFiltered
} from '../../common/entries/actions';
import { DEFAULT_PAGE_SIZE } from '../../common/entries/reducer';
import { toggleUploadDialog, toggleUploadProgress } from '../../common/ui/actions';
/* eslint-enable comma-dangle */

type Props = {
  pathname: string,
  isDialogActive: boolean,
  isUploadInProgress: boolean,
  toggleUploadProgress: Function,
  toggleUploadDialog: Function,
  uploadData: ?Object,
  getUploadData: Function,
  uploadCsv: Function,
  fetchSchema: Function,
  fetchEntries: Function,
  fetchAggs: Function,
  fetchDateHistogram: Function,
  setCurrentPage: Function,
  setPageSize: Function,
  setSearchFilter: Function,
  setSortedBy: Function,
  setSelectedIds: Function,
  setSelectedNormalizeBar: Function,
  setOutlierIds: Function,
  setOutliersFiltered: Function,
  firstFieldOfInterest: ?string,
  secondFieldOfInterest: ?string,
  schema: Map<string, string>,
  temporalFields: List<string>,
  dateHistogramField: ?string,
  filter: string,
  selectedIds: Set<string>,
  outlierIds: Set<string>,
  outliersFiltered: boolean,
};

const { ONE_SECOND_AS_MILLIS: ONE_SECOND } = Durations;

export class UploadDialog extends React.Component {

  props: Props;

  handleDialogToggle() {
    const { isUploadInProgress, toggleUploadDialog } = this.props;

    if (!isUploadInProgress) {
      toggleUploadDialog();
    }
  }

  async handleInputChange(event: Event) {
    const {
      toggleUploadProgress,
      getUploadData,
      uploadCsv,
      setCurrentPage,
      setPageSize,
      setSearchFilter,
      setSelectedIds,
      setSelectedNormalizeBar,
      setOutlierIds,
      setOutliersFiltered,
      setSortedBy,
      fetchSchema,
      fetchEntries,
      toggleUploadDialog,
      pathname,
    } = this.props;

    toggleUploadProgress();

    await getUploadData(event);
    await uploadCsv(this.props.uploadData);

    setCurrentPage(FIRST_PAGE);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSearchFilter('');
    setSortedBy('');
    setSelectedIds([]);
    setOutlierIds([]);
    setOutliersFiltered(false);
    setSelectedNormalizeBar(null);

    // @formatter:off
    setTimeout(async () => { // @formatter:on
      await fetchSchema();
      await fetchEntries(this.props.schema);

      if (pathname === CHART_PAGE_PATH) {
        const {
          fetchAggs,
          firstFieldOfInterest,
          secondFieldOfInterest,
          fetchDateHistogram,
          dateHistogramField,
          filter,
          selectedIds,
          outlierIds,
          outliersFiltered,
        } = this.props;
        const ids = outliersFiltered ? outlierIds : selectedIds;

        await fetchAggs(firstFieldOfInterest, secondFieldOfInterest, filter, ids);

        if (dateHistogramField) {
          fetchDateHistogram(dateHistogramField, DEFAULT_DATE_HISTOGRAM_INTERVAL, filter, ids);
        }
      }

      toggleUploadDialog();
      toggleUploadProgress();
    }, ONE_SECOND); // Let ES refresh.
  }

  render() {
    const { isUploadInProgress, isDialogActive } = this.props;

    return (
      <Dialog
        actions={[
          {
            label: 'Cancel',
            onClick: () => this.handleDialogToggle(),
            disabled: isUploadInProgress,
          },
        ]}
        active={isDialogActive}
        onEscKeyDown={() => this.handleDialogToggle()}
        onOverlayClick={() => this.handleDialogToggle()}
        title="Upload CSV Data"
      >
        <p className={styles.description}>
          <strong>Drag & drop</strong> file here<br />
          <strong>or</strong> select via dialog:
        </p>
        <form className={styles.upload}>
          <input
            type="file"
            onChange={event => this.handleInputChange(event)}
            disabled={isUploadInProgress}
          />
          <ProgressBar className={isUploadInProgress ? '' : styles.hidden} />
        </form>
      </Dialog>
    );
  }

}

export default connect(state => ({
  isDialogActive: state.ui.isUploadDialogActive,
  isUploadInProgress: state.ui.isUploadInProgress,
  uploadData: state.entries.uploadData,
  selectedIds: state.entries.selectedIds,
  outlierIds: state.entries.outlierIds,
  outliersFiltered: state.entries.outliersFiltered,
  firstFieldOfInterest: state.entries.firstFieldOfInterest,
  secondFieldOfInterest: state.entries.secondFieldOfInterest,
  schema: state.entries.schema,
  temporalFields: state.entries.temporalFields,
  dateHistogramField: state.entries.dateHistogramField,
  filter: state.entries.filter,
}), {
  toggleUploadDialog,
  toggleUploadProgress,
  getUploadData,
  uploadCsv,
  setCurrentPage,
  setPageSize,
  setSearchFilter,
  setSelectedIds,
  setOutlierIds,
  setOutliersFiltered,
  setSortedBy,
  setSelectedNormalizeBar,
  fetchSchema,
  fetchEntries,
  fetchAggs,
  fetchDateHistogram,
})(UploadDialog);
