// @flow
/* eslint-disable comma-dangle */
import React from 'react';
import Card from 'react-toolbox/lib/card';
import Dropdown from 'react-toolbox/lib/dropdown';
import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { format } from 'date-fns';
import d3 from 'd3/d3';
import nv from 'nvd3/build/nv.d3';
import 'nvd3/build/nv.d3.css';
import { toggleNormalizeDialog, toggleMultiActionProgress } from '../../common/ui/actions';
import {
  fetchNormalizeDateHistogram,
  setSelectedNormalizeBar,
  transformEntries,
  fetchEntriesPaged
} from '../../common/entries/actions';
import { Durations, getDropdownSource, getDropdownValue } from '../../common/lib/utils/index';
import classnames from 'classnames';
import styles from './NormalizeDialog.scss';
import { SCALE_YEAR, SCALE_MONTH } from '../../common/entries/reducer';
/* eslint-enable comma-dangle */

type Props = {
  pathname: string,
  isDialogActive: boolean,
  isMultiActionInProgress: boolean,
  toggleNormalizeDialog: Function,
  toggleMultiActionProgress: Function,
  fetchEntriesPaged: Function,
  fetchNormalizeDateHistogram: Function,
  setSelectedNormalizeBar: Function,
  transformEntries: Function,
  temporalFields: List<string>,
  dateHistogram: List<Object>,
  dateHistogramField: string,
  dateHistogramInterval: string,
  selectedBar: ?number,
  entries: List<Object>,
  currentPage: number,
  pageSize: number,
  schema: Map<*, *>,
  filter: string,
  sortedBy: string,
};
type State = {
  dropdownValue: ?string,
  intervalDropdownValue: string,
  monthDropdownValue: number,
  yearInputValue: number,
};

const CHART_CONTAINER_ID = 'normalize-chart';
const CHART_HEIGHT = '300px';
const NV_BAR_SELECTOR = 'g.nv-bar';
const BLACK = 'black';
const FORMAT_YEAR = 'YYYY';
const NO_TIMESTAMP = null;
const MONTHS = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const { ONE_SECOND_AS_MILLIS: ONE_SECOND } = Durations;

const _renderChart = (props: Props) => {
  const valueFormat = d3.format('d');
  const data = props.dateHistogram.toJS();
  const barTextFormat = props.dateHistogramInterval === SCALE_MONTH ?
    'MMMM YYYY' : FORMAT_YEAR;

  nv.addGraph(() => {
    const chart = nv.models.discreteBarChart()
      .x(d => format(d.key, barTextFormat))
      .y(d => d.doc_count)
      .staggerLabels(true)
      .showValues(true)
      .valueFormat(valueFormat)
      .color(['grey'])
      .duration(350);

    chart.yAxis
      .tickFormat(valueFormat);

    chart.discretebar.dispatch.on('elementClick', event => {
      props.setSelectedNormalizeBar(event.index);
      (document.querySelectorAll(NV_BAR_SELECTOR): any).forEach(bar => {
        bar.style = 'fill: grey';
      });
      setTimeout(() => {
        event.element.style = { fill: BLACK };
      }, 10);
    });

    d3.select(`#${CHART_CONTAINER_ID} svg`)
      .datum([{ key: 'data', values: data }])
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
};

const _highlightBar = (selectedBar: ?number) => setTimeout(() => {
  (document.querySelectorAll(NV_BAR_SELECTOR): any)[selectedBar].style = { fill: BLACK };
}, 10);

export class NormalizeDialog extends React.Component {

  state: State = {
    dropdownValue: this.props.dateHistogramField,
    intervalDropdownValue: this.props.dateHistogramInterval,
    monthDropdownValue: 1,
    yearInputValue: format(this.props.dateHistogram.isEmpty() ?
        Date.now() : this.props.dateHistogram.get(0).key,
      FORMAT_YEAR,
    ),
  };

  componentWillMount() {
    const { fetchNormalizeDateHistogram, dateHistogramField } = this.props;
    const { intervalDropdownValue: interval } = this.state;

    if (dateHistogramField) { // @formatter:off
      (async () => { // @formatter:on
        await fetchNormalizeDateHistogram(dateHistogramField, interval);

        this.setState({ dropdownValue: dateHistogramField });
      })();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { fetchNormalizeDateHistogram, entries, selectedBar } = this.props;
    const { intervalDropdownValue: interval } = this.state;

    const nextDateHistogramField = nextProps.dateHistogramField;
    const hasNextDateHistogramField = nextDateHistogramField !== null;
    const entriesChanged = entries !== nextProps.entries;

    if (hasNextDateHistogramField && entriesChanged) { // @formatter:off
      (async () => { // @formatter:on
        await fetchNormalizeDateHistogram(nextDateHistogramField, interval);

        this.setState({ dropdownValue: nextDateHistogramField });
      })();
    }

    const nextSelectedBar = nextProps.selectedBar;
    const nasNextSelectedBar = nextSelectedBar !== null;
    const selectedBarChanged = nextSelectedBar !== selectedBar;

    if (nasNextSelectedBar && selectedBarChanged) {
      const firstBarDate = this.props.dateHistogram.get(0).key;
      const firstBarYear = format(firstBarDate, FORMAT_YEAR);

      this.setState({ yearInputValue: firstBarYear });
    }
  }

  props: Props;

  handleDialogToggle() {
    const {
      isMultiActionInProgress,
      toggleNormalizeDialog,
      setSelectedNormalizeBar,
    } = this.props;

    if (isMultiActionInProgress) {
      return;
    }

    toggleNormalizeDialog();
    setSelectedNormalizeBar(null);
  }

  async handleDropdownChange(dropdownValue: string) {
    const { fetchNormalizeDateHistogram, setSelectedNormalizeBar } = this.props;
    const { intervalDropdownValue: interval } = this.state;

    await fetchNormalizeDateHistogram(dropdownValue, interval);
    setSelectedNormalizeBar(null);

    this.setState({ dropdownValue });
  }

  async handleIntervalDropdownChange(intervalDropdownValue: string) {
    const {
      fetchNormalizeDateHistogram,
      dateHistogramField,
      setSelectedNormalizeBar,
    } = this.props;

    await fetchNormalizeDateHistogram(dateHistogramField, intervalDropdownValue);
    setSelectedNormalizeBar(null);

    this.setState({ intervalDropdownValue });
  }

  handleMonthDropdownChange(monthDropdownValue: number) {
    this.setState({ monthDropdownValue });

    const { selectedBar } = this.props;
    if (selectedBar != null) {
      _highlightBar(selectedBar);
    }
  }

  handleYearInputChange(yearInputValue: number) {
    this.setState({ yearInputValue });

    const { selectedBar } = this.props;
    if (selectedBar != null) {
      _highlightBar(selectedBar);
    }
  }

  async handleTransformClick() {
    const {
      transformEntries,
      currentPage,
      pageSize,
      schema,
      filter,
      sortedBy,
      dateHistogram,
      dateHistogramField,
      selectedBar,
      fetchEntriesPaged,
      toggleMultiActionProgress,
      toggleNormalizeDialog,
    } = this.props;

    _highlightBar(selectedBar);
    toggleMultiActionProgress();

    const selectedBarEpochMillis = (dateHistogram: any).get(selectedBar).key;
    const queryDate = new Date(selectedBarEpochMillis).toISOString();
    const scale = this.props.dateHistogramInterval;
    const year = Number(this.state.yearInputValue);
    const month = scale === SCALE_MONTH ? this.state.monthDropdownValue : null;

    await transformEntries(dateHistogramField, queryDate, scale, NO_TIMESTAMP, year, month);

    // @formatter:off
    setTimeout(async () => { // @formatter:on
      await fetchEntriesPaged(currentPage, pageSize, schema, filter, sortedBy);

      toggleNormalizeDialog();
      toggleMultiActionProgress();
    }, ONE_SECOND);
  }

  render() {
    if (process.env.IS_BROWSER && !this.props.dateHistogram.isEmpty()) {
      _renderChart(this.props);
    }

    const { isDialogActive, isMultiActionInProgress } = this.props;

    return (
      <Dialog
        actions={[
          {
            label: 'Transform',
            onClick: () => this.handleTransformClick(),
            disabled: this.props.selectedBar == null || isMultiActionInProgress,
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
        title="Normalize"
      >
        <Card className={styles.chart}>
          <div id={CHART_CONTAINER_ID} style={{ minWidth: '100%' }}>
            <svg width="100%" height={CHART_HEIGHT} />
          </div>
          <section className={styles.controls}>
            <Dropdown
              source={getDropdownSource(this.props.temporalFields)}
              onChange={value => this.handleDropdownChange(value)}
              label="Temporal field"
              value={
                  getDropdownValue(
                    this.state.dropdownValue,
                    this.props.dateHistogramField,
                  )
                }
            />
            <Dropdown
              source={[
                { label: 'Year', value: SCALE_YEAR },
                { label: 'Month', value: SCALE_MONTH },
              ]}
              onChange={value => this.handleIntervalDropdownChange(value)}
              label="Interval"
              value={
                  getDropdownValue(
                    this.state.intervalDropdownValue,
                    this.props.dateHistogramInterval,
                  )
                }
            />
          </section>
        </Card>
        <ProgressBar className={isMultiActionInProgress ? '' : styles.hidden} />
        <span
          className={classnames(
            styles.targetControls,
            this.props.selectedBar === null ? styles.notDisplayed : '',
          )}
        >
          <Dropdown
            className={this.props.dateHistogramInterval === SCALE_YEAR ? styles.notDisplayed : ''}
            source={MONTHS}
            onChange={value => this.handleMonthDropdownChange(value)}
            label="Target month"
            value={this.state.monthDropdownValue}
          />
          <Input
            type="number"
            pattern="\\d{4}"
            label="Target year"
            name="year"
            value={this.state.yearInputValue}
            onChange={year => this.handleYearInputChange(year)}
          />
        </span>
      </Dialog>
    );
  }

}

export default connect(state => ({
  isDialogActive: state.ui.isNormalizeDialogActive,
  isMultiActionInProgress: state.ui.isMultiActionInProgress,
  temporalFields: state.entries.temporalFields,
  dateHistogram: state.entries.normalizeDateHistogram,
  dateHistogramField: state.entries.normalizeDateHistogramField,
  dateHistogramInterval: state.entries.normalizeDateHistogramInterval,
  selectedBar: state.entries.normalizeDateHistogramSelectedBar,
  entries: state.entries.list,
  currentPage: state.entries.currentPage,
  pageSize: state.entries.pageSize,
  schema: state.entries.schema,
  filter: state.entries.filter,
  sortedBy: state.entries.sortedBy,
}), {
  toggleNormalizeDialog,
  toggleMultiActionProgress,
  fetchEntriesPaged,
  fetchNormalizeDateHistogram,
  setSelectedNormalizeBar,
  transformEntries,
})(NormalizeDialog);
