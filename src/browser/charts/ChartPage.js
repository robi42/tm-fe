// @flow
/* eslint-disable comma-dangle */
import Card from 'react-toolbox/lib/card';
import IconButton from 'react-toolbox/lib/button';
import Tooltip from 'react-toolbox/lib/tooltip';
import Dropdown from 'react-toolbox/lib/dropdown';
import Title from '../components/Title';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Map, Set } from 'immutable';
import { compose } from 'ramda';
import classnames from 'classnames';
import d3 from 'd3/d3';
import nv from 'nvd3/build/nv.d3';
import 'nvd3/build/nv.d3.css';
import CalendarHeatmap from 'cal-heatmap/cal-heatmap';
import 'cal-heatmap/cal-heatmap.css';
import styles from './ChartPage.scss';
import {
  DEFAULT_DATE_HISTOGRAM_INTERVAL,
  fetchSchema,
  fetchEntriesPaged,
  fetchAggs,
  fetchDateHistogram,
  setCalendarHeatmapScale,
  setMultiActionQuery
} from '../../common/entries/actions';
import {
  KEY_FIRST_FIELD_OF_INTEREST,
  KEY_SECOND_FIELD_OF_INTEREST,
  KEY_DATE_HISTOGRAM_FIELD,
  SCALE_YEAR,
  SCALE_MONTH,
  SCALE_WEEK,
  SCALE_DAY,
  SCALE_HOUR
} from '../../common/entries/reducer';
import { toggleMultiActionDialog } from '../../common/ui/actions';
import { getDropdownSource, getDropdownValue, toUtcDate } from '../../common/lib/utils';
/* eslint-enable comma-dangle */

const CALENDAR_HEATMAP_ID = 'cal-heatmap';
const CALENDAR_HEATMAP_NEXT_ID = `${CALENDAR_HEATMAP_ID}-next`;
const CALENDAR_HEATMAP_PREVIOUS_ID = `${CALENDAR_HEATMAP_ID}-previous`;

const FIRST_CHART_CONTAINER_ID = 'chart-container-0';
const SECOND_CHART_CONTAINER_ID = 'chart-container-1';

const CHART_HEIGHT = '684px';
const CHART_CONTAINER_STYLE = {
  minWidth: '50%',
  minHeight: CHART_HEIGHT,
};

type State = {
  firstChartDropdownValue: string,
  secondChartDropdownValue: string,
  calendarHeatmapDropdownValue: string,
  calendarHeatmapScaleDropdownValue: string,
};

const TooltipButton = Tooltip(IconButton);

const _clearCalendarHeatmapContainer = () => {
  const container = document.querySelector(`#${CALENDAR_HEATMAP_ID}`);

  if (container != null) {
    container.innerHTML = '';
  }
};

const _getCalendarHeatmapLegend = (props: Object): number[] => (
  props.dateHistogram
    .valueSeq()
    .toSet()
    .toJS()
    .sort((a, b) => {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    })
);

const _getCalendarHeatmapSubdomain = (domain: string): string => {
  if (domain === SCALE_YEAR) return SCALE_MONTH;
  if (domain === SCALE_DAY) return SCALE_HOUR;
  return 'x_day';
};

const _getCalendarHeatmapRange = (domain: string): number => {
  if (domain === SCALE_YEAR) return 6;
  if (domain === SCALE_DAY) return 16;
  return 10;
};

const _renderCalendarHeatmap = (props: Object, scale: string) => {
  if (!props.dateHistogram.isEmpty()) {
    _clearCalendarHeatmapContainer();

    const calendarHeatmap = new CalendarHeatmap();
    calendarHeatmap.init({
      itemSelector: `#${CALENDAR_HEATMAP_ID}`,
      nextSelector: `#${CALENDAR_HEATMAP_NEXT_ID}`,
      previousSelector: `#${CALENDAR_HEATMAP_PREVIOUS_ID}`,
      tooltip: true,
      range: _getCalendarHeatmapRange(scale),
      start: new Date(props.dateHistogram.keySeq().first() * 1000),
      domain: scale,
      subDomain: _getCalendarHeatmapSubdomain(scale),
      cellSize: 15,
      cellPadding: 3,
      domainGutter: 15,
      data: props.dateHistogram.toJS(),
      legend: _getCalendarHeatmapLegend(props),
      onClick: (date, numberOfItems) => {
        const utcDate = toUtcDate(date.getTime());

        if (numberOfItems) {
          props.setMultiActionQuery({
            fieldName: KEY_DATE_HISTOGRAM_FIELD,
            date: utcDate,
            scale,
            count: numberOfItems,
          });
          props.toggleMultiActionDialog();
        }
      },
    });
  }
};

const _getFieldOfInterestName = (elementId: string): string => {
  if (elementId === FIRST_CHART_CONTAINER_ID) {
    return KEY_FIRST_FIELD_OF_INTEREST;
  }
  if (elementId === SECOND_CHART_CONTAINER_ID) {
    return KEY_SECOND_FIELD_OF_INTEREST;
  }
  return KEY_DATE_HISTOGRAM_FIELD;
};

const _renderChart = (containerId: string, data: Object[], props: Object) => {
  const valueFormat = d3.format('d');

  nv.addGraph(() => {
    const chart = nv.models.discreteBarChart()
      .x(d => d.key_as_string || d.key)
      .y(d => d.doc_count)
      .staggerLabels(true)
      .showValues(true)
      .valueFormat(valueFormat)
      .color(['grey'])
      .duration(350);

    chart.yAxis
      .tickFormat(valueFormat);

    chart.discretebar.dispatch.on('elementClick', event => {
      const fieldOfInterestName = _getFieldOfInterestName(containerId, props);
      props.setMultiActionQuery({ fieldName: fieldOfInterestName, bucketIndex: event.index });
      props.toggleMultiActionDialog();
    });

    d3.select(`#${containerId} svg`)
      .datum([{ key: 'data', values: data }])
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
};

const _getChartData = (aggs: Map<*, *>, keyName: string) => (
  aggs.isEmpty() ? [] : aggs.toJS()[keyName].buckets
);

const _renderCharts = (props: Object) => {
  const { aggs } = props;
  const firstChartData = _getChartData(aggs, KEY_FIRST_FIELD_OF_INTEREST);
  const secondChartData = _getChartData(aggs, KEY_SECOND_FIELD_OF_INTEREST);

  _renderChart(FIRST_CHART_CONTAINER_ID, firstChartData, props);
  _renderChart(SECOND_CHART_CONTAINER_ID, secondChartData, props);
};

export class ChartPage extends React.Component {

  static propTypes = {
    intl: intlShape.isRequired,
    fetchSchema: PropTypes.func.isRequired,
    fetchEntriesPaged: PropTypes.func.isRequired,
    fetchAggs: PropTypes.func.isRequired,
    fetchDateHistogram: PropTypes.func.isRequired,
    setCalendarHeatmapScale: PropTypes.func.isRequired,
    firstFieldOfInterest: PropTypes.string,
    secondFieldOfInterest: PropTypes.string,
    fields: PropTypes.object,
    temporalFields: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    aggs: PropTypes.object.isRequired,
    dateHistogram: PropTypes.object.isRequired,
    dateHistogramField: PropTypes.string,
    calendarHeatmapScale: PropTypes.string.isRequired,
    filter: PropTypes.string.isRequired,
    sortedBy: PropTypes.string.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    selectedIds: PropTypes.object.isRequired,
    outlierIds: PropTypes.object.isRequired,
    outliersFiltered: PropTypes.bool.isRequired,
    toggleMultiActionDialog: PropTypes.func.isRequired,
  };

  state: State = {
    firstChartDropdownValue: this.props.firstFieldOfInterest,
    secondChartDropdownValue: this.props.secondFieldOfInterest,
    calendarHeatmapDropdownValue: this.props.dateHistogramField,
    calendarHeatmapScaleDropdownValue: this.props.calendarHeatmapScale,
  };

  componentWillMount() {
    const {
      fetchSchema,
      fetchEntriesPaged,
      fetchAggs,
      fetchDateHistogram,
      currentPage,
      pageSize,
      filter,
      sortedBy,
      selectedIds,
      outlierIds,
      outliersFiltered,
    } = this.props;

    if (process.env.IS_BROWSER) { // @formatter:off
      (async () => { // @formatter:on
        await fetchSchema();

        const { schema } = this.props;
        await fetchEntriesPaged(currentPage, pageSize, schema, filter, sortedBy, outlierIds);

        const { firstFieldOfInterest, secondFieldOfInterest } = this.props;
        const ids = outliersFiltered ? outlierIds : selectedIds;
        await fetchAggs(firstFieldOfInterest, secondFieldOfInterest, filter, ids);

        const { dateHistogramField } = this.props;
        if (dateHistogramField != null) {
          await fetchDateHistogram(
            dateHistogramField,
            DEFAULT_DATE_HISTOGRAM_INTERVAL,
            filter,
            ids,
          );
        }
      })();
    }
  }

  componentWillReceiveProps(nextProps: Object) {
    const {
      entries: nextEntries,
      firstFieldOfInterest: nextFirstFieldOfInterest,
      secondFieldOfInterest: nextSecondFieldOfInterest,
      aggs: nextAggs,
      dateHistogram: nextDateHistogram,
      selectedIds: nextSelectedIds,
      outlierIds: nextOutlierIds,
    } = nextProps;

    if ((!this.props.selectedIds.isEmpty() && nextSelectedIds.isEmpty()) ||
      (!this.props.outlierIds.isEmpty() && nextOutlierIds.isEmpty())) {
      const { fetchAggs, fetchDateHistogram, filter, dateHistogramField } = this.props;
      const emptyIds = Set();

      // @formatter:off
      (async () => { // @formatter:on
        await fetchAggs(nextFirstFieldOfInterest, nextSecondFieldOfInterest, filter, emptyIds);

        if (dateHistogramField != null) {
          await fetchDateHistogram(
            dateHistogramField,
            DEFAULT_DATE_HISTOGRAM_INTERVAL,
            filter,
            emptyIds,
          );
        }
      })();
    }

    if (!nextEntries.isEmpty() && nextFirstFieldOfInterest != null && nextAggs.isEmpty()) {
      const {
        fetchAggs,
        fetchDateHistogram,
        dateHistogramField,
        filter,
        selectedIds,
        outlierIds,
        outliersFiltered,
      } = this.props;
      const ids = outliersFiltered ? outlierIds : selectedIds;

      // @formatter:off
      (async () => { // @formatter:on
        await fetchAggs(nextFirstFieldOfInterest, nextSecondFieldOfInterest, filter, ids);

        if (dateHistogramField != null) {
          fetchDateHistogram(
            dateHistogramField,
            DEFAULT_DATE_HISTOGRAM_INTERVAL,
            filter,
            ids,
          );
        }
      })();

      this.setState({
        firstChartDropdownValue: nextFirstFieldOfInterest,
        secondChartDropdownValue: nextSecondFieldOfInterest,
      });
    }

    if (this.props.dateHistogram.isEmpty() || nextDateHistogram !== this.props.dateHistogram) {
      _renderCalendarHeatmap(nextProps, nextProps.calendarHeatmapScale);

      const { dateHistogramField } = nextProps;
      this.setState({ calendarHeatmapDropdownValue: dateHistogramField });
    }
  }

  handleCalendarHeatmapDropdownChange(dropdownValue: string) {
    const { fetchDateHistogram, filter, selectedIds, outlierIds, outliersFiltered } = this.props;
    const ids = outliersFiltered ? outlierIds : selectedIds;
    fetchDateHistogram(dropdownValue, DEFAULT_DATE_HISTOGRAM_INTERVAL, filter, ids);
    this.setState({ calendarHeatmapDropdownValue: dropdownValue });
  }

  handleCalendarHeatmapScaleDropdownChange(dropdownValue: string) {
    const { setCalendarHeatmapScale } = this.props;
    setCalendarHeatmapScale(dropdownValue);
    _renderCalendarHeatmap(this.props, dropdownValue);
    this.setState({ calendarHeatmapScaleDropdownValue: dropdownValue });
  }

  handleFirstChartDropdownChange(dropdownValue: string) {
    const {
      fetchAggs,
      secondFieldOfInterest,
      filter,
      selectedIds,
      outlierIds,
      outliersFiltered,
    } = this.props;
    const ids = outliersFiltered ? outlierIds : selectedIds;
    fetchAggs(dropdownValue, secondFieldOfInterest, filter, ids);
    this.setState({ firstChartDropdownValue: dropdownValue });
  }

  handleSecondChartDropdownChange(dropdownValue: string) {
    const {
      fetchAggs,
      firstFieldOfInterest,
      filter,
      selectedIds,
      outlierIds,
      outliersFiltered,
    } = this.props;
    const ids = outliersFiltered ? outlierIds : selectedIds;
    fetchAggs(firstFieldOfInterest, dropdownValue, filter, ids);
    this.setState({ secondChartDropdownValue: dropdownValue });
  }

  render() {
    if (process.env.IS_BROWSER) {
      _renderCharts(this.props);
    }

    const calendarHeatmapDisplayed = this.props.temporalFields.isEmpty() ? styles.notDisplayed : '';
    const { calendarHeatmapScaleDropdownValue: calendarHeatmapScale } = this.state;
    const hasNarrowCalendarHeatmap =
      calendarHeatmapScale === SCALE_YEAR ||
      calendarHeatmapScale === SCALE_WEEK;

    return (
      <div className={styles.main}>
        <Title message="Charts" />
        <Card>
          <div className={classnames(styles.calendarHeatmap, calendarHeatmapDisplayed)}>
            <section className={styles.controls}>
              <span id={CALENDAR_HEATMAP_PREVIOUS_ID}>
                <TooltipButton
                  flat
                  tooltip="Previous"
                  icon="navigate_before"
                />
              </span>
              <Dropdown
                source={getDropdownSource(this.props.temporalFields)}
                onChange={value => this.handleCalendarHeatmapDropdownChange(value)}
                label="Temporal field"
                value={
                  getDropdownValue(
                    this.state.calendarHeatmapDropdownValue,
                    this.props.dateHistogramField,
                  )
                }
              />
              <Dropdown
                source={[
                  { label: 'Year', value: SCALE_YEAR },
                  { label: 'Month', value: SCALE_MONTH },
                  { label: 'Week', value: SCALE_WEEK },
                  { label: 'Day', value: SCALE_DAY },
                ]}
                onChange={value => this.handleCalendarHeatmapScaleDropdownChange(value)}
                label="Temporal scale"
                value={
                  getDropdownValue(
                    this.state.calendarHeatmapScaleDropdownValue,
                    this.props.calendarHeatmapScale,
                  )
                }
              />
              <span id={CALENDAR_HEATMAP_NEXT_ID}>
                <TooltipButton
                  flat
                  tooltip="Next"
                  icon="navigate_next"
                />
              </span>
            </section>
            <div id={CALENDAR_HEATMAP_ID} style={{ padding: hasNarrowCalendarHeatmap ? '3% 0' : 0 }} />
          </div>
        </Card>
        <Card>
          <div className={styles.charts}>
            <div id={FIRST_CHART_CONTAINER_ID} style={CHART_CONTAINER_STYLE}>
              <svg width="100%" height={CHART_HEIGHT} />
            </div>
            <div id={SECOND_CHART_CONTAINER_ID} style={CHART_CONTAINER_STYLE}>
              <svg width="100%" height={CHART_HEIGHT} />
            </div>
            <section className={styles.controls}>
              <Dropdown
                source={getDropdownSource(this.props.fields)}
                onChange={value => this.handleFirstChartDropdownChange(value)}
                label="Field"
                value={
                  getDropdownValue(
                    this.state.firstChartDropdownValue,
                    this.props.firstFieldOfInterest,
                  )
                }
              />
              <Dropdown
                source={getDropdownSource(this.props.fields)}
                onChange={value => this.handleSecondChartDropdownChange(value)}
                label="Field"
                value={
                  getDropdownValue(
                    this.state.secondChartDropdownValue,
                    this.props.secondFieldOfInterest,
                  )
                }
              />
            </section>
          </div>
        </Card>
      </div>
    );
  }

}

export default compose(connect(state => ({
  entries: state.entries.list,
  firstFieldOfInterest: state.entries.firstFieldOfInterest,
  secondFieldOfInterest: state.entries.secondFieldOfInterest,
  fields: state.entries.fields,
  temporalFields: state.entries.temporalFields,
  schema: state.entries.schema,
  aggs: state.entries.aggs,
  dateHistogram: state.entries.dateHistogram,
  dateHistogramField: state.entries.dateHistogramField,
  calendarHeatmapScale: state.entries.calendarHeatmapScale,
  filter: state.entries.filter,
  sortedBy: state.entries.sortedBy,
  currentPage: state.entries.currentPage,
  pageSize: state.entries.pageSize,
  selectedIds: state.entries.selectedIds,
  outlierIds: state.entries.outlierIds,
  outliersFiltered: state.entries.outliersFiltered,
}), {
  fetchSchema,
  fetchEntriesPaged,
  fetchAggs,
  fetchDateHistogram,
  setCalendarHeatmapScale,
  setMultiActionQuery,
  toggleMultiActionDialog,
}), injectIntl)(ChartPage);
