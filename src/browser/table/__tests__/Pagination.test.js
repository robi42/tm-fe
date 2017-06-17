import React from 'react';
import { Pagination } from '../Pagination';
import { mount } from 'enzyme';
import { spy } from 'sinon';

test('<Pagination /> calls fetch entries paged on last button click', () => {
  const fetchEntriesPaged = spy();
  const wrapper = mount(
    <Pagination
      {...{
        fetchEntriesPaged,
        setCurrentPage: () => {},
        currentPage: 0,
        pageSize: 15,
      }}
    />,
  );

  wrapper.find('button').last().simulate('click');

  expect(fetchEntriesPaged.calledOnce).toBe(true);
});
