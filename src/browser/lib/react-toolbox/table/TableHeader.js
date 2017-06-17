// @flow
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import classnames from 'classnames';
import { compose } from 'ramda';
import { FontIcon } from 'react-toolbox/lib/font_icon';
import { DragSource, DropTarget } from 'react-dnd';

type Props = {
  headerKey: string,
  name: string,
  isTemporal: boolean,
  onHeaderClick: Function,
  onHeaderDrop: Function,
  toggleMergeDialog: Function,
  sortIconClass: string,
  hiddenClass: string,
  descClass: string,

  // Injected by React DnD:
  isDragging: boolean,
  isOver: boolean,
  isOverCurrent: boolean,
  canDrop: boolean,
  itemType: string,
  connectDragSource: Function,
  connectDropTarget: Function,
};

const TABLE_HEADER = 'TABLE_HEADER';
const NO_EVENT = null;

const _dragSource = {
  beginDrag(props: Props) {
    return {
      headerKey: props.headerKey,
    };
  },
};

const _dropTarget = {
  canDrop(props: Props, monitor: any): boolean {
    return props.isTemporal &&
      props.headerKey !== monitor.getItem().headerKey;
  },

  drop(props: Props, monitor: any) {
    const item = monitor.getItem();
    props.onHeaderDrop(NO_EVENT, {
      sourceField: item.headerKey,
      targetField: props.headerKey,
    });
  },
};

const _collectDragSource = (connect: any, monitor: any): Object => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
});

const _collectDropTarget = (connect: any, monitor: any): Object => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export class TableHeader extends React.Component {

  static renderOverlay(color: string) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          zIndex: 1,
          opacity: 0.2,
          backgroundColor: color,
        }}
      />
    );
  }

  props: Props;

  render() {
    const {
      headerKey,
      name,
      isTemporal,
      onHeaderClick,
      sortIconClass,
      hiddenClass,
      descClass,
      isDragging,
      isOver,
      canDrop,
      connectDropTarget,
      connectDragSource,
    } = this.props;

    const markup = (
      <th
        onClick={onHeaderClick}
        data-field={headerKey}
        title={`Click to sort${isTemporal ? ' or drag to merge' : ''}`}
        style={{
          cursor: isTemporal ? 'move' : 'pointer',
          opacity: isDragging ? 0.6 : 1,
        }}
      >
        <FontIcon
          className={classnames(sortIconClass, hiddenClass, descClass)}
          value="arrow_upward"
        />
        {name}
        {isOver && !canDrop && TableHeader.renderOverlay('orange')}
        {!isOver && canDrop && TableHeader.renderOverlay('yellow')}
        {isOver && canDrop && TableHeader.renderOverlay('green')}
      </th>
    );

    return isTemporal ?
      connectDropTarget(connectDragSource(markup)) :
      connectDropTarget(markup);
  }

}

export default compose(
  DragSource(TABLE_HEADER, _dragSource, _collectDragSource),
  DropTarget(TABLE_HEADER, _dropTarget, _collectDropTarget),
)(TableHeader);
