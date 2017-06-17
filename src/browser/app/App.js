// @flow
import type { State } from '../../common/types';
import styles from './App.scss';
import Header from './Header';
import Footer from './Footer';
import Helmet from 'react-helmet';
import React from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import SockJS from 'sockjs-client/dist/sockjs';
import 'stompjs/lib/stomp';
import { compose } from 'ramda';
import favicon from '../../common/app/favicon';
import start from '../../common/app/start';
import { setOutlierIds } from '../../common/entries/actions';
import { Match } from '../../common/components';
import { connect } from 'react-redux';
import TablePage from '../table/TablePage';
import ChartPage from '../charts/ChartPage';
import { serverUrl, supportsBrowserNotification } from '../../common/lib/utils';

export const TABLE_PAGE_PATH = '/';
export const CHART_PAGE_PATH = '/charts';

export const EVENT_OUTLIERS = 'outliers';

// v4-alpha.getbootstrap.com/getting-started/introduction/#starter-template
const bootstrap4Metas: any = [
  { charset: 'utf-8' },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
  },
  {
    'http-equiv': 'x-ua-compatible',
    content: 'ie=edge',
  },
];

type Props = {
  currentLocale: string,
  setOutlierIds: Function,
};

export class App extends React.Component {

  componentDidMount() {
    if (process.env.IS_BROWSER) {
      if (supportsBrowserNotification() &&
        window.Notification.permission !== 'granted') {
        window.Notification.requestPermission();
      }

      const socket = new SockJS(`${serverUrl()}/${EVENT_OUTLIERS}`);
      const stompClient = window.Stomp.over(socket);

      stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/${EVENT_OUTLIERS}`, message => {
          const outliers = JSON.parse(message.body);
          this.props.setOutlierIds(outliers);
        });
      });
    }
  }

  props: Props;

  render() {
    const { currentLocale } = this.props;

    return (
      <div className={styles.container}>
        <Helmet
          htmlAttributes={{ lang: currentLocale }}
          titleTemplate="TempMunger - %s"
          meta={[
            ...bootstrap4Metas,
            {
              name: 'description',
              content: 'Munge temporal data',
            },
            ...favicon.meta,
          ]}
          link={[
            ...favicon.link,
          ]}
        />
        <Match pattern="*" component={Header} />
        <main className={styles.content}>
          <Match exactly pattern={TABLE_PAGE_PATH} component={TablePage} />
          <Match pattern={CHART_PAGE_PATH} component={ChartPage} />
        </main>
        <Footer />
      </div>
    );
  }

}

export default compose(
  DragDropContext(HTML5Backend),
  connect(
    (state: State) => ({
      currentLocale: state.intl.currentLocale,
    }), { setOutlierIds },
  ),
  start,
)(App);
