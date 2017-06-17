// @flow
import compression from 'compression';
import express from 'express';
import render from './render';

const app: any = express();

app.use(compression());
app.use('/assets', express.static('build', { maxAge: '200d' }));

app.get('/robots.txt', (request, response) => {
  response.type('text/plain');
  response.send('User-agent: *\nDisallow: /');
});

app.get('*', render);

export default app;
