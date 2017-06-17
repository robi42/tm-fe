// @flow
import React from 'react';
import Snackbar from 'react-toolbox/lib/snackbar';
import { connect } from 'react-redux';
import { Durations } from '../../common/lib/utils';
import { appError } from '../../common/app/actions';

type State = {
  active: boolean,
};
type Props = {
  error: ?string,
  appError: Function,
};

const {
  ONE_SECOND_AS_MILLIS: ONE_SECOND,
  THREE_SECONDS_AS_MILLIS: THREE_SECONDS,
} = Durations;

export class ErrorSnackbar extends React.Component {

  state: State = {
    active: this.props.error != null,
  };

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.error != null) {
      this.setState({ active: true });
    }
  }

  props: Props;

  handleClick() {
    this.handleTimeout();
  }

  handleTimeout() {
    this.setState({ active: false });
    setTimeout(() => {
      this.props.appError({ message: null });
    }, ONE_SECOND);
  }

  render() {
    return (
      <Snackbar
        action="Dismiss"
        active={this.state.active}
        label={this.props.error}
        timeout={THREE_SECONDS}
        onClick={() => this.handleClick()}
        onTimeout={() => this.handleTimeout()}
        type="warning"
      />
    );
  }

}

export default connect(state => ({
  error: state.app.error,
}), { appError })(ErrorSnackbar);
