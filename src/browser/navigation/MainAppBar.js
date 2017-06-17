// @flow
/* eslint-disable comma-dangle */
import AppBar from 'react-toolbox/lib/app_bar';
import Avatar from 'react-toolbox/lib/avatar';
import Chip from 'react-toolbox/lib/chip';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import { Button, IconButton } from 'react-toolbox/lib/button';
import Input from 'react-toolbox/lib/input';
import Navigation from 'react-toolbox/lib/navigation';
import Tooltip from 'react-toolbox/lib/tooltip';
import { Link } from 'react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { List, Map, Set } from 'immutable';
import UploadDialog from './UploadDialog';
import ExportDialog from './ExportDialog';
import MissingDialog from './MissingDialog';
import NormalizeDialog from './NormalizeDialog';
import MergeDialog from './MergeDialog';
import MultiActionDialog from './MultiActionDialog';
import ErrorSnackbar from './ErrorSnackbar';
import OutlierSnackbar from './OutlierSnackbar';
import linkMessages from '../../common/app/linkMessages';
import styles from './MainAppBar.scss';
import theme from './MainAppBar.theme.scss';
import { TABLE_PAGE_PATH, CHART_PAGE_PATH } from '../app/App';
import { toggleUploadDialog, toggleExportDialog } from '../../common/ui/actions';
import {
  FIRST_PAGE,
  DEFAULT_DATE_HISTOGRAM_INTERVAL,
  fetchEntriesPaged,
  fetchAggs,
  fetchDateHistogram,
  setSearchFilter,
  setSelectedIds,
  setCurrentPage,
  setPageSize,
  setOutlierIds,
  setOutliersFiltered,
  setSortedBy,
  fetchEntries
} from '../../common/entries/actions';
import { Strings, serverUrl } from '../../common/lib/utils';
import { DEFAULT_PAGE_SIZE } from '../../common/entries/reducer';
/* eslint-enable comma-dangle */

type State = {
  searchFilter: string,
};
type Props = {
  pathname: string,
  loading: boolean,
  toggleUploadDialog: Function,
  toggleExportDialog: Function,
  setCurrentPage: Function,
  setPageSize: Function,
  setSearchFilter: Function,
  setSortedBy: Function,
  setSelectedIds: Function,
  setOutlierIds: Function,
  setOutliersFiltered: Function,
  fetchEntriesPaged: Function,
  fetchEntries: Function,
  fetchAggs: Function,
  fetchDateHistogram: Function,
  firstFieldOfInterest: ?string,
  secondFieldOfInterest: ?string,
  dateHistogramField: ?string,
  temporalFields: List<string>,
  pageSize: number,
  schema: Map<string, string>,
  filter: string,
  sortedBy: string,
  selectedIds: Set<string>,
  outlierIds: Set<string>,
  outliersFiltered: boolean,
};

const TooltipButton = Tooltip(Button);
const TooltipIconButton = Tooltip(IconButton);

const SEARCH_INPUT = `.${styles.search} input`;
const KEYDOWN = 'keydown';
const ESC_KEY = 27;
const EMPTY = '';

export class MainAppBar extends React.Component {

  state: State = {
    searchFilter: this.props.filter,
  };

  componentDidMount() {
    document.querySelector(SEARCH_INPUT)
      .addEventListener(KEYDOWN, (event: KeyboardEvent) =>
        this.handleSearchFilterEscKey(event));
  }

  componentWillReceiveProps(nextProps: Object) {
    const { filter } = nextProps;

    if (filter === EMPTY) {
      this.setState({ searchFilter: filter });
    }
  }

  componentWillUnmount() {
    document.querySelector(SEARCH_INPUT)
      .removeEventListener(KEYDOWN, (event: KeyboardEvent) =>
        this.handleSearchFilterEscKey(event));
  }

  props: Props;

  handleSearchFilterEscKey(event: KeyboardEvent) {
    if (event.which !== ESC_KEY) {
      return;
    }
    this.clearSearchFilter();
  }

  handleUploadButtonClick() {
    this.props.toggleUploadDialog();
  }

  handleExportButtonClick(event: Event) {
    const { temporalFields, toggleExportDialog } = this.props;

    if (!temporalFields.isEmpty()) {
      event.preventDefault();
      toggleExportDialog();
    }
  }

  handleSearchFilterClearButtonClick() {
    this.clearSearchFilter();
  }

  clearSearchFilter() {
    const { filter } = this.props;
    if (Strings.isNullOrEmpty(filter)) {
      return;
    }
    this.handleSearchFilterChange(EMPTY);
  }

  handleSearchFilterChange(value: string) {
    const {
      setSearchFilter,
      setCurrentPage,
      fetchEntriesPaged,
      pageSize,
      schema,
      sortedBy,
    } = this.props;

    this.setState({ searchFilter: value });

    setSearchFilter(value);
    setCurrentPage(FIRST_PAGE);
    fetchEntriesPaged(FIRST_PAGE, pageSize, schema, value, sortedBy);

    if (this.isOnChartPage()) {
      const {
        fetchAggs,
        fetchDateHistogram,
        dateHistogramField,
        firstFieldOfInterest,
        secondFieldOfInterest,
        selectedIds,
        outlierIds,
        outliersFiltered,
      } = this.props;
      const ids = outliersFiltered ? outlierIds : selectedIds;

      fetchAggs(firstFieldOfInterest, secondFieldOfInterest, value, ids);

      if (dateHistogramField != null) {
        fetchDateHistogram(
          dateHistogramField,
          DEFAULT_DATE_HISTOGRAM_INTERVAL,
          value,
          ids,
        );
      }
    }
  }

  handleSearchFilterKeyPress(event: Object) {
    const nativeEvent = event.nativeEvent;

    if (nativeEvent.code.toLowerCase() === 'enter') {
      const { setCurrentPage, fetchEntriesPaged, pageSize, schema, sortedBy } = this.props;
      const { searchFilter } = this.state;

      setCurrentPage(FIRST_PAGE);
      fetchEntriesPaged(FIRST_PAGE, pageSize, schema, searchFilter, sortedBy);

      if (this.isOnChartPage()) {
        const {
          fetchAggs,
          firstFieldOfInterest,
          secondFieldOfInterest,
          selectedIds,
          outlierIds,
          outliersFiltered,
        } = this.props;
        const ids = outliersFiltered ? outlierIds : selectedIds;

        fetchAggs(firstFieldOfInterest, secondFieldOfInterest, searchFilter, ids);
      }
    }
  }

  handleChipDeleteClick() {
    const {
      schema,
      setCurrentPage,
      setPageSize,
      setSearchFilter,
      setSelectedIds,
      setOutlierIds,
      setSortedBy,
      setOutliersFiltered,
      fetchEntries,
    } = this.props;

    setCurrentPage(FIRST_PAGE);
    setPageSize(DEFAULT_PAGE_SIZE);
    setSearchFilter('');
    setSortedBy('');
    setSelectedIds([]);
    setOutlierIds([]);
    setOutliersFiltered(false);

    fetchEntries(schema);
  }

  isOnTablePage() {
    const { pathname } = this.props;
    return pathname === TABLE_PAGE_PATH;
  }

  isOnChartPage() {
    const { pathname } = this.props;
    return pathname === CHART_PAGE_PATH;
  }

  render() {
    return (
      <AppBar className={styles.appbar} fixed flat>
        <h1 className={styles.title}>
          <Link to={TABLE_PAGE_PATH}>
            <FormattedMessage {...linkMessages.home} />
          </Link>
        </h1>
        <ProgressBar
          className={this.props.loading ? EMPTY : styles.hidden}
          type="circular"
          mode="indeterminate"
          multicolor
        />
        <TooltipIconButton
          tooltip="Clear search filter"
          className={styles.clearSearch}
          disabled={this.state.searchFilter === EMPTY}
          icon="clear"
          onClick={() => this.handleSearchFilterClearButtonClick()}
        />
        <Input
          className={styles.search}
          theme={theme}
          type="text"
          icon="search"
          label="Search"
          hint="Filter"
          name="search"
          value={this.state.searchFilter}
          onChange={value => this.handleSearchFilterChange(value)}
          onKeyPress={event => this.handleSearchFilterKeyPress(event)}
        />
        <Chip
          deletable
          onDeleteClick={() => this.handleChipDeleteClick()}
          className={this.props.selectedIds.isEmpty() &&
                     !this.props.outliersFiltered ?
                     styles.hidden : EMPTY}
        >
          <Avatar style={{ backgroundColor: 'deepskyblue' }} icon="list" />
          <span>Row filter</span>
        </Chip>
        <Navigation className={styles.navigation}>
          <Link to={TABLE_PAGE_PATH}>
            <Button
              label="Table"
              raised={this.isOnTablePage()}
            />
          </Link>
          <Link to={CHART_PAGE_PATH}>
            <Button
              label="Charts"
              raised={this.isOnChartPage()}
            />
          </Link>
        </Navigation>
        <TooltipButton
          tooltip="Upload"
          className={styles.button} icon="cloud_upload" floating accent
          onClick={() => this.handleUploadButtonClick()}
        />
        <form method="POST" action={`${serverUrl()}/temporal-entries/export`} target="_blank">
          <TooltipButton
            tooltip="Export"
            type="submit"
            className={styles.button}
            icon="file_download"
            floating
            primary
            onClick={event => this.handleExportButtonClick(event)}
          />
        </form>
        <UploadDialog {...this.props} />
        <ExportDialog {...this.props} />
        <MissingDialog {...this.props} />
        <NormalizeDialog {...this.props} />
        <MergeDialog {...this.props} />
        <MultiActionDialog {...this.props} />
        <OutlierSnackbar {...this.props} />
        <ErrorSnackbar />
      </AppBar>
    );
  }

}

export default connect(state => ({
  loading: state.app.loading,
  pageSize: state.entries.pageSize,
  schema: state.entries.schema,
  filter: state.entries.filter,
  sortedBy: state.entries.sortedBy,
  selectedIds: state.entries.selectedIds,
  outlierIds: state.entries.outlierIds,
  outliersFiltered: state.entries.outliersFiltered,
  firstFieldOfInterest: state.entries.firstFieldOfInterest,
  secondFieldOfInterest: state.entries.secondFieldOfInterest,
  dateHistogramField: state.entries.dateHistogramField,
  temporalFields: state.entries.temporalFields,
}), {
  toggleUploadDialog,
  toggleExportDialog,
  setSearchFilter,
  setSortedBy,
  setSelectedIds,
  setOutlierIds,
  setOutliersFiltered,
  setCurrentPage,
  setPageSize,
  fetchEntriesPaged,
  fetchEntries,
  fetchAggs,
  fetchDateHistogram,
})(MainAppBar);
