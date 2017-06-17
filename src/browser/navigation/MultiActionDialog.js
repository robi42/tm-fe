// @flow
/* eslint-disable comma-dangle */
import React from 'react';
import Dialog from 'react-toolbox/lib/dialog';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import DatePicker from 'react-toolbox/lib/date_picker';
import TimePicker from 'react-toolbox/lib/time_picker';
import { connect } from 'react-redux';
import { Set } from 'immutable';
import { format } from 'date-fns';
import { Durations, fromUtcDate, toUtcDate } from '../../common/lib/utils';
import { toggleMultiActionDialog, toggleMultiActionProgress } from '../../common/ui/actions';
import {
  deleteEntriesByFieldValue,
  transformEntries,
  fetchAggs,
  fetchDateHistogram,
  DEFAULT_DATE_HISTOGRAM_INTERVAL
} from '../../common/entries/actions';
import classnames from 'classnames';
import styles from './MultiActionDialog.scss';
import theme from './DateTimePicker.theme.scss';
import { SCALE_YEAR, SCALE_MONTH, SCALE_WEEK, SCALE_DAY } from '../../common/entries/reducer';
/* eslint-enable comma-dangle */

type Props = {
  pathname: string,
  query: Object,
  filter: string,
  selectedIds: Set<string>,
  outlierIds: Set<string>,
  outliersFiltered: boolean,
  firstFieldOfInterest: string,
  secondFieldOfInterest: string,
  dateHistogramField: string,
  isDialogActive: boolean,
  isMultiActionInProgress: boolean,
  toggleMultiActionDialog: Function,
  toggleMultiActionProgress: Function,
  deleteEntriesByFieldValue: Function,
  transformEntries: Function,
  fetchAggs: Function,
  fetchDateHistogram: Function,
};
type State = {
  transformDate: Date,
  isTimePickerActive: boolean,
};

const { ONE_SECOND_AS_MILLIS: ONE_SECOND } = Durations;

const _format = (value: string, scale: string): string => {
  if (scale === SCALE_YEAR) {
    return format(value, 'MMMM YYYY');
  }
  if (scale === SCALE_MONTH || scale === SCALE_WEEK) {
    return format(value, 'YYYY-M-D');
  }
  if (scale === SCALE_DAY) {
    return `${format(fromUtcDate(value), 'YYYY-M-D, H')}h`;
  }
  return value;
};

const _convert = (scale: string): string => {
  if (scale === SCALE_YEAR) {
    return SCALE_MONTH;
  }
  if (scale === SCALE_MONTH) {
    return SCALE_WEEK;
  }
  return scale;
};

export class MultiActionDialog extends React.Component {

  state: State = {
    transformDate: fromUtcDate(this.props.query.value),
    isTimePickerActive: false,
  };

  componentWillReceiveProps(nextProps: Object) {
    if (nextProps.query.value !== this.props.query.value) {
      this.setState({ transformDate: fromUtcDate(nextProps.query.value) });
    }
  }

  props: Props;

  handleDateTimeInputChange(value: Date) {
    this.setState({
      transformDate: value,
      isTimePickerActive: false,
    });
  }

  handleTimePickerClick() {
    this.setState({ isTimePickerActive: true });
  }

  handleTimePickerOverlayClick() {
    this.setState({ isTimePickerActive: false });
  }

  handleTimePickerEscKeyDown() {
    this.setState({ isTimePickerActive: false });
  }

  handleTimePickerDismiss() {
    this.setState({ isTimePickerActive: false });
  }

  async handleNormalizeClick() {
    const {
      transformEntries,
      query,
      filter,
      selectedIds,
      outlierIds,
      outliersFiltered,
      firstFieldOfInterest,
      secondFieldOfInterest,
      dateHistogramField,
      fetchAggs,
      fetchDateHistogram,
      toggleMultiActionProgress,
      toggleMultiActionDialog,
    } = this.props;
    const ids = outliersFiltered ? outlierIds : selectedIds;

    toggleMultiActionProgress();

    const toBeDate = toUtcDate(this.state.transformDate.getTime());

    await transformEntries(
      dateHistogramField,
      new Date(query.value).toISOString(),
      _convert(query.scale),
      toBeDate.getTime(),
    );

    // @formatter:off
    setTimeout(async () => { // @formatter:on
      await fetchAggs(firstFieldOfInterest, secondFieldOfInterest, filter, ids);
      await fetchDateHistogram(
        dateHistogramField,
        DEFAULT_DATE_HISTOGRAM_INTERVAL,
        filter,
        ids,
      );

      toggleMultiActionDialog();
      toggleMultiActionProgress();
    }, ONE_SECOND);
  }

  async handleDeleteClick() {
    const {
      deleteEntriesByFieldValue,
      query,
      filter,
      selectedIds,
      outlierIds,
      outliersFiltered,
      firstFieldOfInterest,
      secondFieldOfInterest,
      dateHistogramField,
      fetchAggs,
      fetchDateHistogram,
      toggleMultiActionProgress,
      toggleMultiActionDialog,
    } = this.props;
    const ids = outliersFiltered ? outlierIds : selectedIds;

    toggleMultiActionProgress();
    await deleteEntriesByFieldValue(query.field, query.value, _convert(query.scale), filter, ids);

    // @formatter:off
    setTimeout(async () => { // @formatter:on
      await fetchAggs(firstFieldOfInterest, secondFieldOfInterest, filter, ids);

      if (dateHistogramField != null) {
        await fetchDateHistogram(
          dateHistogramField,
          DEFAULT_DATE_HISTOGRAM_INTERVAL,
          filter,
          ids,
        );
      }

      toggleMultiActionDialog();
      toggleMultiActionProgress();
    }, ONE_SECOND);
  }

  handleDialogToggle() {
    const { isMultiActionInProgress, toggleMultiActionDialog } = this.props;

    if (!isMultiActionInProgress) {
      toggleMultiActionDialog();
    }
  }

  render() {
    const { isMultiActionInProgress, isDialogActive, query } = this.props;

    return (
      <Dialog
        actions={[
          {
            label: 'Normalize',
            onClick: () => this.handleNormalizeClick(),
            disabled: isMultiActionInProgress || !query.isTemporal,
          },
          {
            label: 'Delete',
            onClick: () => this.handleDeleteClick(),
            disabled: isMultiActionInProgress,
          },
          {
            label: 'Cancel',
            onClick: () => this.handleDialogToggle(),
            disabled: isMultiActionInProgress,
          },
        ]}
        active={isDialogActive}
        onEscKeyDown={() => this.handleDialogToggle()}
        onOverlayClick={() => this.handleDialogToggle()}
        title={`${query.count} Rows`}
        type="small"
      >
        <p className={styles.description}>
          with <strong>{query.field}:</strong> <em>{_format(query.value, query.scale)}</em>
        </p>
        <ProgressBar className={isMultiActionInProgress ? '' : styles.hidden} />
        <span className={classnames(theme.inputFields, !query.isTemporal ? styles.notDisplayed : '')}>
          <DatePicker
            sundayFirstDayOfWeek
            theme={theme}
            inputFormat={value => `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`}
            value={this.state.transformDate}
            onChange={value => this.handleDateTimeInputChange(value)}
          />
          <TimePicker
            theme={theme}
            active={this.state.isTimePickerActive}
            value={this.state.transformDate}
            onChange={value => this.handleDateTimeInputChange(value)}
            onClick={() => this.handleTimePickerClick()}
            onOverlayClick={() => this.handleTimePickerOverlayClick()}
            onEscKeyDown={() => this.handleTimePickerEscKeyDown()}
            onDismiss={() => this.handleTimePickerDismiss()}
          />
        </span>
      </Dialog>
    );
  }

}

export default connect(state => ({
  query: state.entries.multiActionQuery,
  firstFieldOfInterest: state.entries.firstFieldOfInterest,
  secondFieldOfInterest: state.entries.secondFieldOfInterest,
  dateHistogramField: state.entries.dateHistogramField,
  filter: state.entries.filter,
  selectedIds: state.entries.selectedIds,
  outlierIds: state.entries.outlierIds,
  outliersFiltered: state.entries.outliersFiltered,
  isDialogActive: state.ui.isMultiActionDialogActive,
  isMultiActionInProgress: state.ui.isMultiActionInProgress,
}), {
  toggleMultiActionDialog,
  toggleMultiActionProgress,
  deleteEntriesByFieldValue,
  transformEntries,
  fetchAggs,
  fetchDateHistogram,
})(MultiActionDialog);
