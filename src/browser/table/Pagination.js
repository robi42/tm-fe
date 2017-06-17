// @flow
import Button from 'react-toolbox/lib/button';
import Tooltip from 'react-toolbox/lib/tooltip';
import Dropdown from 'react-toolbox/lib/dropdown';
import React from 'react';
import { range } from 'ramda';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import styles from './Pagination.scss';
import { setPageSize, setCurrentPage, fetchEntriesPaged } from '../../common/entries/actions';
import { DEFAULT_PAGE_SIZE } from '../../common/entries/reducer';

type Entries = {
  list: List<*>,
};

type Props = {
  entries: Entries,
  setPageSize: Function,
  setCurrentPage: Function,
  fetchEntriesPaged: Function,
  currentPage: number,
  pageSize: number,
  totalEntries: number,
  schema: Map<string, string>,
  filter: string,
  sortedBy: string,
};

type State = {
  pageDropdownValue: number,
  pageSizeDropdownValue: number,
};

const TooltipButton = Tooltip(Button);

const FIRST_PAGE = 0;

const PAGE_SIZE_DROPDOWN_SOURCE = [
  { value: 15, label: '15' },
  { value: DEFAULT_PAGE_SIZE, label: `${DEFAULT_PAGE_SIZE}` },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];

const _getTotalPages = (props: Props): number => Math.ceil(props.totalEntries / props.pageSize);

const _getLastPage = (props: Props): number => _getTotalPages(props) - 1;

const _isFirstPage = (props: Props): boolean => props.currentPage === FIRST_PAGE;

const _isLastPage = (props: Props): boolean => props.currentPage === _getTotalPages(props) - 1;

const _getPageDropdownSource = (props: Props): Object[] => {
  const source = [];

  if (props.totalEntries) {
    const { totalEntries, pageSize } = props;
    const totalPages = _getTotalPages(props);

    range(FIRST_PAGE, totalPages).forEach(i => {
      const to = (i + 1) * pageSize;
      const from = (to - pageSize) + 1;
      source.push({
        value: i,
        label: `${from}-${to > totalEntries ? totalEntries : to} of ${totalEntries}`,
      });
    });
  }

  return source;
};

const _getPageDropdownValue = (state: State, props: Props): number => {
  const { pageDropdownValue } = state;
  const { currentPage } = props;

  return pageDropdownValue !== currentPage ? currentPage : pageDropdownValue;
};

export class Pagination extends React.Component {

  state: State = {
    pageDropdownValue: this.props.currentPage + 1,
    pageSizeDropdownValue: this.props.pageSize,
  };

  componentWillReceiveProps(nextProps: Object) {
    const { entries: list, currentPage } = nextProps;

    if (!list.isEmpty()) {
      this.setState({ pageDropdownValue: currentPage });
    }
  }

  props: Props;

  handleRefreshButtonClick() {
    const { fetchEntriesPaged, currentPage, pageSize, schema, filter, sortedBy } = this.props;
    fetchEntriesPaged(currentPage, pageSize, schema, filter, sortedBy);
  }

  handlePageSizeDropdownChange(dropdownValue: number) {
    const { setPageSize, fetchEntriesPaged, currentPage, schema, filter, sortedBy } = this.props;
    setPageSize(dropdownValue);
    fetchEntriesPaged(currentPage, dropdownValue, schema, filter, sortedBy);
    this.setState({ pageSizeDropdownValue: dropdownValue });
  }

  handlePageDropdownChange(dropdownValue: number) {
    const { setCurrentPage, fetchEntriesPaged, pageSize, schema, filter, sortedBy } = this.props;
    setCurrentPage(dropdownValue);
    fetchEntriesPaged(dropdownValue, pageSize, schema, filter, sortedBy);
    this.setState({ pageDropdownValue: dropdownValue });
  }

  handleFirstButtonClick() {
    const { setCurrentPage, fetchEntriesPaged, pageSize, schema, filter, sortedBy } = this.props;
    setCurrentPage(FIRST_PAGE);
    fetchEntriesPaged(FIRST_PAGE, pageSize, schema, filter, sortedBy);
  }

  handlePreviousButtonClick() {
    const {
      setCurrentPage,
      fetchEntriesPaged,
      currentPage: page,
      pageSize,
      schema,
      filter,
      sortedBy,
    } = this.props;
    const previousPage = page - 1;
    setCurrentPage(previousPage);
    fetchEntriesPaged(previousPage, pageSize, schema, filter, sortedBy);
  }

  handleNextButtonClick() {
    const {
      setCurrentPage,
      fetchEntriesPaged,
      currentPage: page,
      pageSize,
      schema,
      filter,
      sortedBy,
    } = this.props;
    const nextPage = page + 1;
    setCurrentPage(nextPage);
    fetchEntriesPaged(nextPage, pageSize, schema, filter, sortedBy);
  }

  handleLastButtonClick() {
    const { setCurrentPage, fetchEntriesPaged, pageSize, schema, filter, sortedBy } = this.props;
    const lastPage = _getLastPage(this.props);
    setCurrentPage(lastPage);
    fetchEntriesPaged(lastPage, pageSize, schema, filter, sortedBy);
  }

  render() {
    return (
      <div className={styles.main}>
        <TooltipButton
          flat
          tooltip="Refresh"
          icon="refresh"
          onClick={() => this.handleRefreshButtonClick()}
        />
        <Dropdown
          source={PAGE_SIZE_DROPDOWN_SOURCE}
          onChange={value => this.handlePageSizeDropdownChange(value)}
          label="Rows per page"
          value={this.props.pageSize}
        />
        <Dropdown
          source={_getPageDropdownSource(this.props)}
          onChange={value => this.handlePageDropdownChange(value)}
          label="Current page rows"
          value={_getPageDropdownValue(this.state, this.props)}
        />
        <TooltipButton
          flat
          tooltip="First"
          icon="first_page"
          disabled={_isFirstPage(this.props)}
          onClick={() => this.handleFirstButtonClick()}
        />
        <TooltipButton
          flat
          tooltip="Previous"
          icon="navigate_before"
          disabled={_isFirstPage(this.props)}
          onClick={() => this.handlePreviousButtonClick()}
        />
        <TooltipButton
          flat
          tooltip="Next"
          icon="navigate_next"
          disabled={_isLastPage(this.props)}
          onClick={() => this.handleNextButtonClick()}
        />
        <TooltipButton
          flat
          tooltip="Last"
          icon="last_page"
          disabled={_isLastPage(this.props)}
          onClick={() => this.handleLastButtonClick()}
        />
      </div>
    );
  }

}

export default connect(state => ({
  currentPage: state.entries.currentPage,
  totalEntries: state.entries.total,
  schema: state.entries.schema,
  filter: state.entries.filter,
  sortedBy: state.entries.sortedBy,
}), { setPageSize, setCurrentPage, fetchEntriesPaged })(Pagination);
