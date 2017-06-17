// @flow
import type { TextProps } from './Text';
import Text from './Text';
import React from 'react';
import { Durations } from '../../common/lib/utils';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  loadingText: {
    defaultMessage: 'Loading',
    id: 'loading.loadingText',
  },
  longLoadingText: {
    defaultMessage: 'Still loading, please check your connection',
    id: 'loading.longLoadingText',
  },
});

type LoadingProps = TextProps & {
  intl: $IntlShape,
};

type LoadingState = {|
  currentText: ?Object,
  |};

const {
  ONE_SECOND_AS_MILLIS: ONE_SECOND,
  TEN_SECONDS_AS_MILLIS: TEN_SECONDS,
} = Durations;

class Loading extends React.Component {
  state: LoadingState = {
    currentText: null,
  };

  componentDidMount() {
    // www.nngroup.com/articles/response-times-3-important-limits
    this.timer = setTimeout(() => {
      this.setState({ currentText: messages.loadingText });
    }, ONE_SECOND);
    this.longTimer = setTimeout(() => {
      this.setState({ currentText: messages.longLoadingText });
    }, TEN_SECONDS);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    clearTimeout(this.longTimer);
  }

  timer: number;
  longTimer: number;
  props: LoadingProps;

  render() {
    const { currentText } = this.state;
    if (!currentText) return null;
    const { intl, ...restProps } = this.props;

    return (
      <Text {...restProps}>
        {intl.formatMessage(currentText)}...
      </Text>
    );
  }
}

export default injectIntl(Loading);
