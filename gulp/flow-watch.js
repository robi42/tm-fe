import bg from 'gulp-bg';
import gulp from 'gulp';

gulp.task('flow-watch', done => {
  gulp.watch('src/**/*.js', bg('npm', 'run', 'flow'));
  done();
});
