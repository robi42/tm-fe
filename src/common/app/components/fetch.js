import React, { PropTypes } from 'react';

const fetch = (...actions) => Wrapped =>
  class Fetch extends React.Component {

    static contextTypes = {
      store: PropTypes.object,
    };

    // For client-side fetching.
    componentDidMount() {
      const { store: { dispatch } } = this.context;
      actions.forEach(action => dispatch(action()));
    }

    render() {
      return <Wrapped {...this.props} />;
    }

  };

export default fetch;
