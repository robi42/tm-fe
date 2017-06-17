// @flow
/* eslint-disable comma-dangle */
import React from 'react';
import Snackbar from 'react-toolbox/lib/snackbar';
import { connect } from 'react-redux';
import { Map, Set } from 'immutable';
import { without } from 'ramda';
import { Durations, supportsBrowserNotification } from '../../common/lib/utils';
import {
  setOutlierIds,
  FIRST_PAGE,
  DEFAULT_DATE_HISTOGRAM_INTERVAL,
  setCurrentPage,
  setPageSize,
  setSearchFilter,
  setSelectedIds,
  setSortedBy,
  fetchSchema,
  fetchEntries,
  fetchAggs,
  fetchDateHistogram,
  setOutliersFiltered
} from '../../common/entries/actions';
import { DEFAULT_PAGE_SIZE } from '../../common/entries/reducer';
import { CHART_PAGE_PATH } from '../app/App';
/* eslint-enable comma-dangle */

type State = {
  active: boolean,
}
type Props = {
  pathname: string,
  outliers: Set<string>,
  schema: Map<string, string>,
  firstFieldOfInterest: ?string,
  secondFieldOfInterest: ?string,
  dateHistogramField: ?string,
  filter: string,
  setOutlierIds: Function,
  setOutliersFiltered: Function,
  setCurrentPage: Function,
  setPageSize: Function,
  setSearchFilter: Function,
  setSelectedIds: Function,
  setSortedBy: Function,
  fetchSchema: Function,
  fetchEntries: Function,
  fetchAggs: Function,
  fetchDateHistogram: Function,
};

const { TEN_SECONDS_AS_MILLIS: TEN_SECONDS } = Durations;

const MESSAGE = 'Potential outliers detected. \nFilter rows accordingly?';

let _notifications = [];

export class OutlierSnackbar extends React.Component {

  state: State = {
    active: !this.props.outliers.isEmpty(),
  };

  componentWillReceiveProps(nextProps: Object) {
    const nextOutliers = nextProps.outliers;

    if (!nextOutliers.isEmpty() && nextOutliers !== this.props.outliers) {
      this.setState({ active: true });

      if (supportsBrowserNotification()) {
        this._sendBrowserNotification();
      }
    }
  }

  props: Props;

  _sendBrowserNotification() {
    const notification = new window.Notification(MESSAGE, {
      icon: '/assets/favicons/favicon.ico',
      requireInteraction: true,
    });

    _notifications.push(notification);

    notification.onclick = () => {
      this.handleClick();
      _notifications = without([notification], _notifications);
    };
  }

  async handleClick() {
    _notifications.forEach(notification => notification.close());

    this.setState({ active: false });

    const {
      schema,
      outliers,
      setCurrentPage,
      setPageSize,
      setSearchFilter,
      setSelectedIds,
      setSortedBy,
      setOutliersFiltered,
      fetchEntries,
      pathname,
    } = this.props;

    if (outliers.isEmpty()) return;

    setCurrentPage(FIRST_PAGE);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSearchFilter('');
    setSelectedIds([]);
    setSortedBy('');

    await fetchEntries(schema, outliers);

    if (pathname === CHART_PAGE_PATH) {
      const {
        fetchAggs,
        firstFieldOfInterest,
        secondFieldOfInterest,
        fetchDateHistogram,
        dateHistogramField,
        filter,
        outliers,
      } = this.props;

      await fetchAggs(firstFieldOfInterest, secondFieldOfInterest, filter, outliers);

      if (dateHistogramField) {
        fetchDateHistogram(dateHistogramField, DEFAULT_DATE_HISTOGRAM_INTERVAL, filter, outliers);
      }
    }

    setOutliersFiltered(true);
  }

  handleTimeout() {
    this.setState({ active: false });
  }

  render() {
    return (
      <Snackbar
        action="Show"
        active={this.state.active}
        label={MESSAGE}
        timeout={TEN_SECONDS}
        onClick={() => this.handleClick()}
        onTimeout={() => this.handleTimeout()}
        type="accept"
      />
    );
  }

}

export default connect(state => ({
  outliers: state.entries.outlierIds,
  schema: state.entries.schema,
  firstFieldOfInterest: state.entries.firstFieldOfInterest,
  secondFieldOfInterest: state.entries.secondFieldOfInterest,
  dateHistogramField: state.entries.dateHistogramField,
  filter: state.entries.filter,
}), {
  setOutlierIds,
  setCurrentPage,
  setPageSize,
  setSearchFilter,
  setSelectedIds,
  setSortedBy,
  setOutliersFiltered,
  fetchSchema,
  fetchEntries,
  fetchAggs,
  fetchDateHistogram,
})(OutlierSnackbar);
