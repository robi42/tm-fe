import React from 'react';
import renderer from 'react-test-renderer';
import { ErrorSnackbar } from '../ErrorSnackbar';

test('<ErrorSnackbar /> renders', () => {
  const tree = renderer.create(
    <ErrorSnackbar error="Something went wrong" />,
  ).toJSON();

  expect(tree).toMatchSnapshot();
});
