/* eslint-disable import/extensions */
import gulp from 'gulp';
import runEslint from './support/run-eslint.js';

gulp.task('eslint-watch', () => {
  gulp.watch([
    'gulp/**/*.js',
    'gulpfile.babel.js',
    'messages/*.js',
    'src/**/*.js',
    'webpack/*.js',
  ], runEslint);
});
