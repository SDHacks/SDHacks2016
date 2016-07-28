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
    plumber = require('gulp-plumber');
    
gulp.task('default', ['watch', 'nodemon']);
gulp.task('test', ['sass', 'jscoffee', 'jshint', 'build-js']);
gulp.task('prod', ['sass', 'jscoffee', 'jshint', 'build-js']);

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

// Coffee Compiler
gulp.task('jscoffee', function() {
  gulp.src('static/assets/coffee/*.coffee')
    .pipe(plumber(plumberOptions))
    .pipe(sourcemaps.init())
      .pipe(coffee())
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('static/assets/js/dist'))
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
  gulp.src('static/assets/js/*.js')
    .pipe(plumber(plumberOptions))
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('static/assets/js/dist'));
});

// Watcher
gulp.task('watch', function() {
  gulp.watch('static/assets/scss/**/*.scss', ['sass']);
  gulp.watch('static/assets/coffee/*.coffee', ['jscoffee']);
  gulp.watch('static/assets/js/*.js', ['jshint']);
  gulp.watch('static/assets/js/*.js', ['build-js']);
});

// Nodemon
gulp.task('nodemon', function() {
  nodemon({
    script: 'server.js',
    ext: 'js coffee',
    env: { 'NODE_ENV': 'development' }
  });
});