// @flow
/* eslint-disable comma-dangle */
import React from 'react';
import Card from 'react-toolbox/lib/card';
import Dialog from 'react-toolbox/lib/dialog';
import Dropdown from 'react-toolbox/lib/dropdown';
import DatePicker from 'react-toolbox/lib/date_picker';
import TimePicker from 'react-toolbox/lib/time_picker';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import d3 from 'd3/d3';
import nv from 'nvd3/build/nv.d3';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import classnames from 'classnames';
import { toggleMissingDialog, toggleMultiActionProgress } from '../../common/ui/actions';
import {
  fetchAvgAgg,
  fetchMissing,
  transformMissingEntries,
  deleteMissingEntries,
  fetchEntriesPaged
} from '../../common/entries/actions';
import styles from './MissingDialog.scss';
import theme from './DateTimePicker.theme.scss';
import { getDropdownSource, getDropdownValue, fromUtcDate, toUtcDate, Durations } from '../../common/lib/utils';
/* eslint-enable comma-dangle */

type Props = {
  isDialogActive: boolean,
  isMultiActionInProgress: boolean,
  toggleMissingDialog: Function,
  toggleMultiActionProgress: Function,
  fetchAvgAgg: Function,
  fetchMissing: Function,
  deleteMissingEntries: Function,
  transformMissingEntries: Function,
  fetchEntriesPaged: Function,
  totalEntries: number,
  currentPage: number,
  pageSize: number,
  schema: Map<*, *>,
  filter: string,
  sortedBy: string,
  temporalFields: List<string>,
  missingField: ?string,
  existingAvg: number,
  missing: Map<*, *>,
};
type State = {
  dropdownValue: ?string,
  missingDate: Date,
  isTimePickerActive: boolean,
};

const { ONE_SECOND_AS_MILLIS: ONE_SECOND } = Durations;

const CHART_CONTAINER_ID = 'missing-chart-container';

const _getChartData = (props: Object): Object[] => [
  {
    key: 'All',
    color: 'grey',
    values: [{ value: props.totalEntries }],
  },
  {
    key: 'Missing',
    color: 'orange',
    values: [{ value: props.missing.toJS().doc_count }],
  },
];

const _renderChart = (props: Object) => {
  const valueFormat = d3.format('d');

  nv.addGraph(() => {
    const chart = nv.models.multiBarHorizontalChart()
      .y(d => d.value)
      .showYAxis(false)
      .showValues(true)
      .valueFormat(valueFormat)
      .duration(350);

    chart.yAxis
      .tickFormat(valueFormat);

    const data = _getChartData(props);

    d3.select(`#${CHART_CONTAINER_ID} svg`)
      .datum(data)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
};

export class MissingDialog extends React.Component {

  state: State = {
    dropdownValue: this.props.missingField,
    missingDate: fromUtcDate(this.props.existingAvg),
    isTimePickerActive: false,
  };

  componentWillMount() {
    const { fetchAvgAgg, fetchMissing, temporalFields } = this.props;

    if (!temporalFields.isEmpty()) { // @formatter:off
      (async () => { // @formatter:on
        const temporalField = temporalFields.first();
        await fetchMissing(temporalField);
        await fetchAvgAgg(temporalField);

        this.setState({
          dropdownValue: temporalField,
          missingDate: fromUtcDate(this.props.existingAvg),
        });
      })();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { fetchMissing, fetchAvgAgg } = this.props;
    const nextTemporalFields = nextProps.temporalFields;
    const temporalFieldChanged = this.props.temporalFields !== nextTemporalFields;

    if (!nextTemporalFields.isEmpty() && temporalFieldChanged) { // @formatter:off
      (async () => { // @formatter:on
        const temporalField = nextTemporalFields.first();
        await fetchMissing(temporalField);
        await fetchAvgAgg(temporalField);

        this.setState({
          dropdownValue: temporalField,
          missingDate: fromUtcDate(this.props.existingAvg),
        });
      })();
    }
  }

  props: Props;

  handleDropdownChange(dropdownValue: string) {
    const { fetchMissing, fetchAvgAgg } = this.props;

    // @formatter:off
    (async () => { // @formatter:on
      await fetchMissing(dropdownValue);
      await fetchAvgAgg(dropdownValue);

      this.setState({
        dropdownValue,
        missingDate: fromUtcDate(this.props.existingAvg),
      });
    })();
  }

  handleDateTimeInputChange(value: Date) {
    this.setState({
      missingDate: value,
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

  async handleFillClick() {
    const {
      transformMissingEntries,
      missingField,
      fetchEntriesPaged,
      fetchMissing,
      currentPage,
      pageSize,
      schema,
      filter,
      sortedBy,
      toggleMultiActionProgress,
      toggleMissingDialog,
    } = this.props;

    toggleMultiActionProgress();

    const date = toUtcDate(this.state.missingDate.getTime());
    await transformMissingEntries(missingField, date.getTime());

    // @formatter:off
    setTimeout(async () => { // @formatter:on
      await fetchEntriesPaged(currentPage, pageSize, schema, filter, sortedBy);
      await fetchMissing(missingField);
      toggleMissingDialog();
      toggleMultiActionProgress();
    }, ONE_SECOND);
  }

  async handleDeleteClick() {
    const {
      deleteMissingEntries,
      missingField,
      fetchEntriesPaged,
      fetchMissing,
      currentPage,
      pageSize,
      schema,
      filter,
      sortedBy,
      toggleMultiActionProgress,
      toggleMissingDialog,
    } = this.props;

    toggleMultiActionProgress();
    await deleteMissingEntries(missingField);

    // @formatter:off
    setTimeout(async () => { // @formatter:on
      await fetchEntriesPaged(currentPage, pageSize, schema, filter, sortedBy);
      await fetchMissing(missingField);
      toggleMissingDialog();
      toggleMultiActionProgress();
    }, ONE_SECOND);
  }

  handleDialogToggle() {
    const { isMultiActionInProgress, toggleMissingDialog } = this.props;

    if (!isMultiActionInProgress) {
      toggleMissingDialog();
    }
  }

  render() {
    if (process.env.IS_BROWSER && !this.props.missing.isEmpty()) {
      _renderChart(this.props);
    }

    const { isDialogActive, isMultiActionInProgress, missing } = this.props;
    const hasNoMissing = missing.isEmpty() || missing.toJS().doc_count === 0;
    const isActionDisabled = isMultiActionInProgress || hasNoMissing;

    return (
      <Dialog
        actions={[
          {
            label: 'Fill',
            disabled: isActionDisabled,
            onClick: () => this.handleFillClick(),
          },
          {
            label: 'Delete',
            disabled: isActionDisabled,
            onClick: () => this.handleDeleteClick(),
          },
          {
            label: 'Cancel',
            disabled: isMultiActionInProgress,
            onClick: () => this.handleDialogToggle(),
          },
        ]}
        active={isDialogActive}
        onEscKeyDown={() => this.handleDialogToggle()}
        onOverlayClick={() => this.handleDialogToggle()}
        title="Missing Values Cleanup"
        type="small"
      >
        <Card>
          <div className={styles.chart}>
            <section className={styles.controls}>
              <Dropdown
                source={getDropdownSource(this.props.temporalFields)}
                onChange={value => this.handleDropdownChange(value)}
                label="Temporal field"
                value={
                  getDropdownValue(
                    this.state.dropdownValue,
                    this.props.missingField,
                  )
                }
              />
            </section>
            <div id={CHART_CONTAINER_ID} style={{ minWidth: '100%' }}>
              <svg width="100%" />
            </div>
          </div>
        </Card>
        <ProgressBar className={isMultiActionInProgress ? '' : styles.hidden} />
        <span className={classnames(theme.inputFields, hasNoMissing ? styles.notDisplayed : '')}>
          <DatePicker
            sundayFirstDayOfWeek
            theme={theme}
            inputFormat={value => `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`}
            value={this.state.missingDate}
            onChange={value => this.handleDateTimeInputChange(value)}
          />
          <TimePicker
            theme={theme}
            active={this.state.isTimePickerActive}
            value={this.state.missingDate}
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
  isDialogActive: state.ui.isMissingDialogActive,
  isMultiActionInProgress: state.ui.isMultiActionInProgress,
  totalEntries: state.entries.total,
  currentPage: state.entries.currentPage,
  pageSize: state.entries.pageSize,
  schema: state.entries.schema,
  filter: state.entries.filter,
  sortedBy: state.entries.sortedBy,
  temporalFields: state.entries.temporalFields,
  missing: state.entries.missing,
  existingAvg: state.entries.existingAvg,
  missingField: state.entries.missingField,
}), {
  toggleMissingDialog,
  toggleMultiActionProgress,
  fetchMissing,
  fetchAvgAgg,
  transformMissingEntries,
  deleteMissingEntries,
  fetchEntriesPaged,
})(MissingDialog);
