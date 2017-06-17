import args from './support/args';
import gulp from 'gulp';

gulp.task('env', () => {
  process.env.NODE_ENV = args.production ? 'production' : 'development';
  // Este uses appVersion for crash reporting to match bad builds easily.
  process.env.appVersion = require('../package').version;
});
