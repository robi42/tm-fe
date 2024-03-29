// @flow
import React from 'react';
import { Match as ReactRouterMatch } from 'react-router';
import { connect } from 'react-redux';

const Match = ({
  component: Component,
  render,
  ...props
}) => (
  <ReactRouterMatch
    {...props}
    render={renderProps => (
      render ? render(renderProps) : <Component {...renderProps} />
    )}
  />
);

Match.propTypes = {
  component: React.PropTypes.any,
  render: React.PropTypes.func,
};

export default connect()(Match);
