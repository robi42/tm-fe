// @flow
import config from './config';
import errorHandler from './lib/errorHandler';
import express from 'express';
import frontend from './frontend';

const app = express();

app.use(frontend);
app.get('*', errorHandler);

const { port } = config;

app.listen(port, () => {
  console.log('Server started on port %d', port);
});
