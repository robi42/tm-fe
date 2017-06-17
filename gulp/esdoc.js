import childProcess from 'child_process';
import gulp from 'gulp';

gulp.task('esdoc', done => {
  childProcess
    .spawn('esdoc', [], { stdio: 'inherit' })
    .on('close', done);
});
