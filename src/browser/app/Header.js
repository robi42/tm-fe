// @flow
import React from 'react';
import { connect } from 'react-redux';
import MainAppBar from '../navigation/MainAppBar';

export const Header = (props: Object) => (
  <MainAppBar {...props} />
);

export default connect()(Header);
