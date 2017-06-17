// @flow
/* eslint-disable comma-dangle */
import React, { PropTypes } from 'react';
import Table from '../lib/react-toolbox/table';
import Tooltip from 'react-toolbox/lib/tooltip';
import Button from 'react-toolbox/lib/button';
import Card from 'react-toolbox/lib/card';
import { IconMenu, MenuItem } from 'react-toolbox/lib/menu';
import { compose, isEmpty, omit, pick, without } from 'ramda';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import Title from '../components/Title';
import Pagination from './Pagination';
import styles from './TablePage.scss';
import { Elasticsearch } from '../../common/lib/utils';
import {
  setSortedBy,
  setSelectedIds,
  fetchSchema,
  fetchEntriesPaged,
  updateEntry,
  deleteEntries,
  setMergeFields
} from '../../common/entries/actions';
import { toggleMissingDialog, toggleNormalizeDialog, toggleMergeDialog } from '../../common/ui/actions';
/* eslint-enable comma-dangle */

type State = {
  selectedRows: number[],
  tableSource: Object[],
};

const TooltipButton = Tooltip(Button);

const _getSelectedRows = (props: any): number[] => {
  const selectedRows = [];
  const idsToRemove = [];
  const { selectedIds } = props;

  selectedIds.forEach(id => {
    const rowIndex = props.entries.findIndex(it => it._id === id);

    if (rowIndex !== -1) {
      selectedRows.push(rowIndex);
    } else {
      idsToRemove.push(id);
    }
  });

  props.setSelectedIds(without(idsToRemove, selectedIds));

  return selectedRows;
};

const _getType = (value: string): any => {
  if (value === 'date') {
    return Date;
  }
  if (value === 'long' || value === 'double') {
    return Number;
  }
  if (value === 'boolean') {
    return Boolean;
  }
  return String;
};

const _getTableModel = (schema: Map<string, string>): Object => {
  const model = {};

  if (schema.isEmpty()) {
    return model;
  }

  schema.entrySeq().forEach(entry => {
    const key = entry[0];
    const value = entry[1];
    model[key] = { type: _getType(value) };
  });

  return model;
};

export class TablePage extends React.Component {

  static propTypes = {
    intl: intlShape.isRequired,
    schema: PropTypes.object.isRequired,
    filter: PropTypes.string.isRequired,
    sortedBy: PropTypes.string.isRequired,
    selectedIds: PropTypes.object.isRequired,
    outlierIds: PropTypes.object.isRequired,
    entries: PropTypes.object.isRequired,
    temporalFields: PropTypes.object.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    setSortedBy: PropTypes.func.isRequired,
    setSelectedIds: PropTypes.func.isRequired,
    fetchSchema: PropTypes.func.isRequired,
    fetchEntriesPaged: PropTypes.func.isRequired,
    updateEntry: PropTypes.func.isRequired,
    deleteEntries: PropTypes.func.isRequired,
    toggleMissingDialog: PropTypes.func.isRequired,
    toggleNormalizeDialog: PropTypes.func.isRequired,
    toggleMergeDialog: PropTypes.func.isRequired,
    setMergeFields: PropTypes.func.isRequired,
  };

  state: State = {
    selectedRows: _getSelectedRows(this.props),
    tableSource: this.props.entries.toJS().map(it =>
      omit([Elasticsearch.ID, Elasticsearch.TIMESTAMP], it)),
  };

  componentWillMount() {
    const {
      fetchSchema,
      fetchEntriesPaged,
      currentPage,
      pageSize,
      filter,
      sortedBy,
      outlierIds,
    } = this.props;
    // @formatter:off
    (async () => { // @formatter:on
      await fetchSchema();

      const { schema } = this.props;
      await fetchEntriesPaged(currentPage, pageSize, schema, filter, sortedBy, outlierIds);
    })();
  }

  componentWillReceiveProps(nextProps: Object) {
    if (!this.props.selectedIds.isEmpty() && nextProps.selectedIds.isEmpty()) {
      this.setState({ selectedRows: [] });
    }
    this.setState({ tableSource: nextProps.entries.toJS() });
  }

  handleHeaderClick(event: any) {
    const { field } = event.target.dataset;
    const {
      sortedBy,
      setSortedBy,
      fetchEntriesPaged,
      currentPage,
      pageSize,
      schema,
      filter,
    } = this.props;

    let newSortedBy = '';
    if (sortedBy === field) {
      newSortedBy = /^-.+/.test(sortedBy) ? field : `-${field}`;
      setSortedBy(newSortedBy);
    } else if (sortedBy === `-${field}`) {
      setSortedBy(newSortedBy);
    } else {
      newSortedBy = field;
      setSortedBy(newSortedBy);
    }

    fetchEntriesPaged(currentPage, pageSize, schema, filter, newSortedBy);
  }

  handleHeaderDrop(fields: Object) {
    const { setMergeFields, toggleMergeDialog } = this.props;

    setMergeFields(fields);
    toggleMergeDialog();
  }

  handleCellChange(row: number, key: string, value: string) {
    const tableSource = this.props.entries.toJS();
    const entry = tableSource[row];
    entry[key] = value;
    this.props.updateEntry(entry._id, pick([key], entry));
    this.setState({ tableSource });
  }

  handleRowSelect(selectedRows: number[]) {
    const { tableSource } = this.state;
    const ids = selectedRows.map(row => tableSource[row]._id);
    this.props.setSelectedIds(ids);
    this.setState({ selectedRows });
  }

  handleDeleteButtonClick() {
    const { deleteEntries, setSelectedIds } = this.props;
    const { selectedRows, tableSource } = this.state;
    const ids = selectedRows.map(row => tableSource[row]._id);
    deleteEntries(ids);
    setSelectedIds([]);
    this.setState({ selectedRows: [] });
  }

  handleMissingMenuItemClick() {
    this.props.toggleMissingDialog();
  }

  handleNormalizeMenuItemClick() {
    this.props.toggleNormalizeDialog();
  }

  render() {
    return (
      <Card className={styles.main}>
        <Title message="Table" />
        <Table
          model={_getTableModel(this.props.schema)}
          sortedBy={this.props.sortedBy}
          onHeaderClick={event => this.handleHeaderClick(event)}
          onHeaderDrop={(event, data) => this.handleHeaderDrop(data)}
          onChange={(row, key, value) => this.handleCellChange(row, key, value)}
          onSelect={selectedRows => this.handleRowSelect(selectedRows)}
          selected={this.state.selectedRows}
          source={this.state.tableSource}
        />
        <section className={styles.controls}>
          <div className={styles.actions}>
            <TooltipButton
              flat
              tooltip="Delete selected"
              icon="delete"
              disabled={isEmpty(this.state.selectedRows)}
              onClick={() => this.handleDeleteButtonClick()}
            />
            <IconMenu>
              <MenuItem
                value="missing"
                icon="find_replace"
                caption="Cleanup"
                disabled={this.props.temporalFields.isEmpty()}
                onClick={() => this.handleMissingMenuItemClick()}
              />
              <MenuItem
                value="normalize"
                icon="build"
                caption="Normalize"
                disabled={this.props.temporalFields.isEmpty()}
                onClick={() => this.handleNormalizeMenuItemClick()}
              />
            </IconMenu>
          </div>
          <Pagination {...this.props} />
        </section>
      </Card>
    );
  }

}

export default compose(connect(state => ({
  schema: state.entries.schema,
  filter: state.entries.filter,
  sortedBy: state.entries.sortedBy,
  selectedIds: state.entries.selectedIds,
  outlierIds: state.entries.outlierIds,
  entries: state.entries.list,
  temporalFields: state.entries.temporalFields,
  currentPage: state.entries.currentPage,
  pageSize: state.entries.pageSize,
}), {
  setSortedBy,
  setSelectedIds,
  fetchSchema,
  fetchEntriesPaged,
  updateEntry,
  deleteEntries,
  toggleMissingDialog,
  toggleNormalizeDialog,
  toggleMergeDialog,
  setMergeFields,
}), injectIntl)(TablePage);
