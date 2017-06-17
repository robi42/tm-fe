/* eslint-disable
 react/jsx-no-bind,
 jsx-a11y/no-static-element-interactions,
 react/no-children-prop */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import * as utils from './utils';
import theme from './DateTimePicker.theme.scss';
import { fromUtcDate, toUtcDate } from '../../../../common/lib/utils';

const TYPE_CHECKBOX = 'checkbox';
const TYPE_TEXT = 'text';
const TYPE_DATE = 'date';

const factory = (Checkbox, DatePicker, TimePicker) => {
  class TableRow extends Component {
    static propTypes = {
      data: PropTypes.object,
      index: PropTypes.number,
      model: PropTypes.object,
      onChange: PropTypes.func,
      onRowClick: PropTypes.func,
      onSelect: PropTypes.func,
      selectable: PropTypes.bool,
      selected: PropTypes.bool,
      theme: PropTypes.shape({
        editable: PropTypes.string,
        row: PropTypes.string,
        selectable: PropTypes.string,
        selected: PropTypes.string,
      }),
    };

    state = {
      temporalFields: {},
      activeTimePicker: {},
    };

    handleInputChange = (index, key, type, event) => {
      let value;
      switch (type) {
        case TYPE_CHECKBOX:
          value = event.target.checked;
          break;
        // Handle contentEditable
        case TYPE_TEXT:
          value = event.target.textContent;
          break;
        case TYPE_DATE:
          value = event;
          this.state.temporalFields[key] = value;
          this.setState({
            temporalFields: this.state.temporalFields,
            activeTimePicker: {},
          });
          break;
        default:
          value = event.target.value;
          break;
      }

      const onChange = this.props.model[key].onChange || this.props.onChange;

      if (type === TYPE_DATE) {
        this.setState({ activeTimePicker: {} });

        const date = toUtcDate(value.getTime());

        onChange(index, key, date);
      } else {
        onChange(index, key, value);
      }
    };

    handleTimePickerClick = key => {
      this.state.activeTimePicker[key] = true;
      this.setState({ activeTimePicker: this.state.activeTimePicker });
    };

    handleTimePickerOverlayClick = () => {
      this.setState({ activeTimePicker: {} });
    };

    handleTimePickerEscKeyDown = () => {
      this.setState({ activeTimePicker: {} });
    };

    handleTimePickerDismiss = () => {
      this.setState({ activeTimePicker: {} });
    };

    renderSelectCell() { // eslint-disable-line consistent-return
      if (this.props.selectable) {
        return (
          <td className={this.props.theme.selectable}>
            <Checkbox checked={this.props.selected} onChange={this.props.onSelect} />
          </td>
        );
      }
    }

    renderCells() {
      return Object.keys(this.props.model).map((key) => (
        <td key={key} onClick={this.props.onRowClick}>{this.renderCell(key)}</td>
      ));
    }

    renderCell(key) { // eslint-disable-line consistent-return
      const value = this.props.data[key];

      // if the value is a valid React element return it directly, since it
      // cannot be edited and should not be converted to a string...
      if (React.isValidElement(value)) { return value; }

      const onChange = this.props.model[key].onChange || this.props.onChange;
      if (onChange) {
        return this.renderInput(key, value);
      } else if (value) {
        return value.toString();
      }
    }

    renderInput(key, value) {
      const index = this.props.index;
      const inputType = utils.inputTypeForPrototype(this.props.model[key].type, value);
      const inputValue = utils.prepareValueForInput(value, inputType);
      const checked = inputType === TYPE_CHECKBOX && value ? true : null;

      if (inputType === TYPE_TEXT) {
        return (
          <div
            children={inputValue}
            contentEditable
            suppressContentEditableWarning
            onInput={this.handleInputChange.bind(null, index, key, inputType)}
          />
        );
      }

      if (inputType === TYPE_DATE) {
        const date = fromUtcDate(inputValue);

        return (
          <spa className={theme.inputFields}>
            <DatePicker
              sundayFirstDayOfWeek
              theme={theme}
              inputFormat={value => `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`}
              value={this.state.temporalFields[key] || date}
              onChange={this.handleInputChange.bind(null, index, key, inputType)}
            />
            <TimePicker
              theme={theme}
              active={this.state.activeTimePicker[key]}
              value={this.state.temporalFields[key] || date}
              onChange={this.handleInputChange.bind(null, index, key, inputType)}
              onClick={this.handleTimePickerClick.bind(null, key)}
              onOverlayClick={this.handleTimePickerOverlayClick.bind(null, key)}
              onEscKeyDown={this.handleTimePickerEscKeyDown.bind(null, key)}
              onDismiss={this.handleTimePickerDismiss.bind(null, key)}
            />
          </spa>
        );
      }

      return (
        <input
          checked={checked}
          onChange={this.handleInputChange.bind(null, index, key, inputType)}
          type={inputType}
          value={inputValue}
        />
      );
    }

    render() {
      const className = classnames(this.props.theme.row, {
        [this.props.theme.editable]: this.props.onChange,
        [this.props.theme.selected]: this.props.selected,
      });

      return (
        <tr data-react-toolbox-table="row" className={className}>
          {this.renderSelectCell()}
          {this.renderCells()}
        </tr>
      );
    }
  }

  return TableRow;
};

export default factory;
