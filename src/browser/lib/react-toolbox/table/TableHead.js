import React, { PropTypes } from 'react';

const factory = (TableHeader, Checkbox) => {
  const TableHead = ({
    model,
    sortedBy,
    onSelect,
    onHeaderClick,
    onHeaderDrop,
    selectable,
    multiSelectable,
    selected,
    theme,
  }) => {
    let selectCell;
    const contentCells = Object.keys(model).map(key => {
      const name = model[key].title || key;
      const hidden = sortedBy !== key && sortedBy !== `-${key}` ? theme.hidden : '';
      const desc = { [theme.desc]: sortedBy === `-${key}` };

      return (
        <TableHeader
          key={key}
          headerKey={key}
          isTemporal={model[key].type === Date}
          name={name}
          onHeaderClick={onHeaderClick}
          onHeaderDrop={onHeaderDrop}
          sortIconClass={theme.sortIcon}
          hiddenClass={hidden}
          descClass={desc}
        />
      );
    });

    if (selectable && multiSelectable) {
      selectCell = (
        <th key="select" className={theme.selectable}>
          <Checkbox onChange={onSelect} checked={selected} />
        </th>
      );
    } else if (selectable) {
      selectCell = (
        <th key="select" className={theme.selectable} />
      );
    }
    return ( // @formatter:off
      <thead>
        <tr>{[selectCell, ...contentCells]}</tr>
      </thead>
    ); // @formatter:on
  };

  TableHead.propTypes = {
    className: PropTypes.string,
    model: PropTypes.object,
    sortedBy: PropTypes.string,
    multiSelectable: PropTypes.bool,
    onSelect: PropTypes.func,
    onHeaderClick: PropTypes.func,
    onHeaderDrop: PropTypes.func,
    selectable: PropTypes.bool,
    selected: PropTypes.bool,
    theme: PropTypes.shape({
      selectable: PropTypes.string,
    }),
  };

  TableHead.defaultProps = {
    className: '',
    model: {},
    selected: false,
  };

  return TableHead;
};

export default factory;
