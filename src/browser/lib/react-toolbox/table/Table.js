/* eslint-disable react/jsx-no-bind, react/jsx-indent */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { themr } from 'react-css-themr';
import { TABLE } from 'react-toolbox/lib/identifiers';
import InjectCheckbox from 'react-toolbox/lib/checkbox/Checkbox';
import InjectFontIcon from 'react-toolbox/lib/font_icon/FontIcon';
import InjectDatePicker from 'react-toolbox/lib/date_picker/DatePicker';
import InjectTimePicker from 'react-toolbox/lib/time_picker/TimePicker';
import tableHeadFactory from './TableHead';
import tableRowFactory from './TableRow';

const factory = (TableHead, TableRow) => {
  class Table extends Component {
    static propTypes = {
      className: PropTypes.string,
      heading: PropTypes.bool,
      model: PropTypes.object,
      multiSelectable: PropTypes.bool,
      onChange: PropTypes.func,
      onRowClick: PropTypes.func,
      onHeaderClick: PropTypes.func,
      onHeaderDrop: PropTypes.func,
      onSelect: PropTypes.func,
      selectable: PropTypes.bool,
      selected: PropTypes.array,
      sortedBy: PropTypes.string,
      source: PropTypes.array,
      theme: PropTypes.shape({
        table: PropTypes.string,
      }),
    };

    static defaultProps = {
      className: '',
      heading: true,
      selectable: true,
      multiSelectable: true,
      selected: [],
      source: [],
    };

    handleFullSelect = () => {
      if (this.props.onSelect) {
        const { source, selected } = this.props;
        const newSelected = source.length === selected.length ? [] : source.map((i, idx) => idx);
        this.props.onSelect(newSelected);
      }
    };

    handleRowSelect = index => {
      if (this.props.onSelect) {
        let newSelection = [...this.props.selected];
        if (this.props.multiSelectable) {
          const position = this.props.selected.indexOf(index);
          newSelection = position !== -1
            ? newSelection.filter((el, idx) => idx !== position)
            : newSelection.concat([index]);
        } else {
          newSelection = [index];
        }
        this.props.onSelect(newSelection);
      }
    };

    handleRowChange = (index, key, value) => {
      if (this.props.onChange) {
        this.props.onChange(index, key, value);
      }
    };

    handleRowClick = (index, event) => {
      if (this.props.onRowClick) {
        this.props.onRowClick(index, event);
      }
    };

    handleHeaderClick = event => {
      if (this.props.onHeaderClick) {
        this.props.onHeaderClick(event);
      }
    };

    handleHeaderDrop = (event, data) => {
      if (this.props.onHeaderDrop) {
        this.props.onHeaderDrop(event, data);
      }
    };

    renderHead() { // eslint-disable-line consistent-return
      if (this.props.heading) {
        const { model, selected, source, selectable, multiSelectable } = this.props;
        const isSelected = selected.length === source.length;
        return (
          <TableHead
            model={model}
            sortedBy={this.props.sortedBy}
            onSelect={this.handleFullSelect}
            onHeaderClick={this.handleHeaderClick}
            onHeaderDrop={this.handleHeaderDrop}
            selectable={selectable}
            multiSelectable={multiSelectable}
            selected={isSelected}
            theme={this.props.theme}
          />
        );
      }
    }

    renderBody() {
      const { source, model, onChange, selectable, selected, theme } = this.props;
      return (
        <tbody>
        {source.map((data, index) => (
          <TableRow
            data={data}
            index={index}
            key={index}
            model={model}
            onChange={onChange ? this.handleRowChange.bind(this) : undefined}
            onSelect={this.handleRowSelect.bind(this, index)}
            onRowClick={this.handleRowClick.bind(this, index)}
            selectable={selectable}
            selected={selected.indexOf(index) !== -1}
            theme={theme}
          />
        ))}
        </tbody>
      );
    }

    render() {
      const { className, theme } = this.props;
      return (
        <table data-react-toolbox="table" className={classnames(theme.table, className)}>
          {this.renderHead()}
          {this.renderBody()}
        </table>
      );
    }
  }

  return Table;
};

const TableHead = tableHeadFactory(InjectCheckbox, InjectFontIcon);
const TableRow = tableRowFactory(InjectCheckbox, InjectDatePicker, InjectTimePicker);
const Table = factory(TableHead, TableRow);

export default themr(TABLE)(Table);
export { factory as tableFactory };
export { Table };
