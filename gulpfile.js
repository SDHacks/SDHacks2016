var gulp   = require('gulp'),
    jshint = require('gulp-jshint'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    sass = require('gulp-sass'),
    nodemon = require('gulp-nodemon'),
    plumber = require('gulp-plumber'),
    path = require('path');
    
gulp.task('default', ['package-js', 'sass', 'watch', 'nodemon']);
gulp.task('test', ['sass', 'jshint', 'package-js']);
gulp.task('prod', ['sass', 'jshint', 'package-js']);

var bowerComponentPath = 'static/assets/bower/bower_components/';
var bowerComponents = [
  path.join(bowerComponentPath, 'jquery/dist/jquery.min.js'),
  path.join(bowerComponentPath, 'foundation-sites/dist/foundation.min.js'),
  path.join(bowerComponentPath, 'd3/d3.min.js'),
  path.join(bowerComponentPath, 'topojson/topojson.min.js'),
  path.join(bowerComponentPath, 'jquery-throttle-debounce/jquery.ba-throttle-debounce.min.js'),
  path.join(bowerComponentPath, 'jquery-form-validator/form-validator/jquery.form-validator.min.js'),
  path.join(bowerComponentPath, 'jquery-form-validator/form-validator/file.js'),
  path.join(bowerComponentPath, 'jquery-ui/jquery-ui.min.js'),
  path.join(bowerComponentPath, 'slick-carousel/slick/slick.min.js')
];

// Handle Errors
function handleError(err) {
  gutil.log(err);
  this.emit('end');
  if(gutil.env.production) {
    process.exit(1);
  }
}

var plumberOptions = {
  errorHandler: handleError
}

// SaSS Builder
gulp.task('sass', function () {
  gulp.src('static/assets/scss/sdhacks.scss')
    .pipe(plumber(plumberOptions))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('static/assets/css'));
});

// JS Linter
gulp.task('jshint', function() {
  gulp.src(['static/app/**/*.js', 'static/assets/js/*.js'])
    .pipe(plumber(plumberOptions))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// JS Builder
gulp.task('build-js', function() {
  gulp.src(['static/assets/js/*.js', 'static/assets/js/vendor/*.js'])
    .pipe(plumber(plumberOptions))
    .pipe(gutil.env.type === 'production' ? sourcemaps.init() : gutil.noop())
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
    .pipe(gutil.env.type === 'production' ? sourcemaps.write() : gutil.noop())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('static/assets/js/dist'));
});

gulp.task('package-js', function() {
  gulp.start(['build-js', 'package-bower']);
});

gulp.task('package-bower', function() {
  gulp.src(bowerComponents, {base: bowerComponentPath})
    .pipe(plumber(plumberOptions))
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('static/assets/js/dist'));
});

// Watcher
gulp.task('watch', function() {
  gulp.watch('static/assets/scss/**/*.scss', ['sass']);
  gulp.watch('static/assets/js/*.js', ['jshint']);
  gulp.watch(['static/assets/js/*.js', 'static/assets/js/vendor/*.js'], ['package-js']);
});

// Nodemon
gulp.task('nodemon', function() {
  nodemon({
    script: 'server.js',
    ext: 'js coffee',
    env: { 'NODE_ENV': 'development' }
  });
});
