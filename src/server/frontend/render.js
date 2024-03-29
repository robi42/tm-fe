// @flow
import App from '../../browser/app/App';
import Helmet from 'react-helmet';
import Html from './Html';
import Promise from 'bluebird';
import React from 'react';
import ServerFetchProvider from './ServerFetchProvider';
import config from '../config';
import configureStore from '../../common/configureStore';
import createInitialState from './createInitialState';
import serialize from 'serialize-javascript';
import { Provider as Redux } from 'react-redux';
import { createServerRenderContext, ServerRouter } from 'react-router';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { toJSON } from '../../common/transit';

const settleAllWithTimeout = promises => Promise
  .all(promises.map(p => p.reflect()))
  .each(inspection => {
    if (inspection.isFulfilled()) return;
    console.log('Server fetch failed:', inspection.reason());
  })
  .timeout(15000) // Do not block rendering forever.
  .catch(error => {
    if (error instanceof Bluebird$TimeoutError) { // eslint-disable-line no-undef
      console.log('Server fetch timeouted:', error);
      return;
    }
    throw error;
  });

// createInitialState loads files, so it must be called once.
const initialState = createInitialState();

const getHost = req =>
  `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers.host}`;

const getLocale = req => process.env.IS_SERVERLESS
  ? config.defaultLocale
  : req.acceptsLanguages(config.locales) || config.defaultLocale;

const createStore = req => configureStore({
  initialState: {
    ...initialState,
    device: {
      ...initialState.device,
      host: getHost(req),
    },
    intl: {
      ...initialState.intl,
      currentLocale: getLocale(req),
      initialNow: Date.now(),
    },
  },
});

const renderBody = (store, context, location, fetchPromises) => {
  const markup = renderToString(
    <Redux store={store}>
      <ServerFetchProvider promises={fetchPromises}>
        <ServerRouter
          context={context}
          location={location}
        >
          <App />
        </ServerRouter>
      </ServerFetchProvider>
    </Redux>,
  );
  return { markup, helmet: Helmet.rewind() };
};

const renderScripts = (state, appJsFilename) =>
  // github.com/yahoo/serialize-javascript#user-content-automatic-escaping-of-html-characters
  // TODO: Switch to CSP, https://github.com/este/este/pull/731
  `
    <script>
      window.__INITIAL_STATE__ = ${serialize(toJSON(state))};
    </script>
    <script src="${appJsFilename}"></script>
  `;

const renderHtml = (state, bodyMarkupWithHelmet) => {
  const {
    styles: { app: appCssFilename },
    javascript: { app: appJsFilename },
  } = global.webpackIsomorphicTools.assets();
  if (!config.isProduction) {
    global.webpackIsomorphicTools.refresh();
  }
  const { markup: bodyMarkup, helmet } = bodyMarkupWithHelmet;
  const scriptsMarkup = renderScripts(state, appJsFilename);
  const markup = renderToStaticMarkup(
    <Html
      appCssFilename={appCssFilename}
      bodyHtml={`<div id="app">${bodyMarkup}</div>${scriptsMarkup}`}
      googleAnalyticsId={config.googleAnalyticsId}
      helmet={helmet}
      isProduction={config.isProduction}
    />,
  );
  return `<!DOCTYPE html>${markup}`;
};

// react-router.now.sh/ServerRouter
// @formatter:off
const render = async (req: Object, res: Object, next: Function) => { // @formatter:on
  try {
    const context = createServerRenderContext();
    const store = createStore(req);
    const fetchPromises = [];

    let body = renderBody(store, context, req.url, fetchPromises);
    const result = context.getResult();

    if (result.redirect) {
      res.redirect(301, result.redirect.pathname + result.redirect.search);
      return;
    }

    if (result.missed) {
      body = renderBody(store, context, req.url);
      const html = renderHtml(store.getState(), body);
      res.status(404).send(html);
      return;
    }

    if (!process.env.IS_SERVERLESS && fetchPromises.length > 0) {
      await settleAllWithTimeout(fetchPromises);
      body = renderBody(store, context, req.url);
    }

    const html = renderHtml(store.getState(), body);
    res.status(200).send(html);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default render;
