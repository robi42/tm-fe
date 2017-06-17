import gulp from 'gulp';
import realFavicon from 'gulp-real-favicon';

// Settings were generated online on https://realfavicongenerator.net
// Guide: https://www.npmjs.com/package/gulp-real-favicon
gulp.task('favicon-generate', done => {
  realFavicon.generateFavicon({
    masterPicture: './src/common/app/favicons/original/favicon.png',
    dest: './src/common/app/favicons',
    iconsPath: '/assets/favicons',
    design: {
      desktopBrowser: {},
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false,
    },
    markupFile: './gulp/support/favicon/favicon-data.json',
  }, done);
});
