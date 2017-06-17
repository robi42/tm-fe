import React from 'react';
import renderer from 'react-test-renderer';
import { List, Map } from 'immutable';
import { MissingDialog } from '../MissingDialog';

test('<MissingDialog /> renders', () => {
  const tree = renderer.create(
    <MissingDialog isDialogActive missing={Map()} temporalFields={List()} />,
  ).toJSON();

  expect(tree).toMatchSnapshot();
});
