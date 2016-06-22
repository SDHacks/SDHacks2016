var gulp   = require('gulp'),
    jshint = require('gulp-jshint'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    gutil = require('gulp-util'),
    imagemin = require('gulp-rename'),
    coffee = require('gulp-coffee'), 
    sass = require('gulp-sass'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'); 
    
gulp.task('default', ['watch']);

// Handle Errors
function handleError(err) {
  gutil.log(err);
  this.emit('end');
}

// SaSS Builder
gulp.task('sass', function () {
  gulp.src('static/assets/scss/sdhacks.scss')
    .pipe(sass({outputStyle: 'compressed'})).on('error', handleError)
    .pipe(rename({ suffix: '.min' })).on('error', handleError)
    .pipe(gulp.dest('static/assets/css'));
});

// Coffee Compiler
gulp.task('jscoffee', function() {
  gulp.src('static/assets/coffee/*.coffee')
    .pipe(sourcemaps.init()).on('error', handleError)
      .pipe(coffee()).on('error', handleError)
      .pipe(uglify()).on('error', handleError)
      .pipe(rename({ suffix: '.min' })).on('error', handleError)
    .pipe(sourcemaps.write()).on('error', handleError)
    .pipe(gulp.dest('static/assets/js/dist')).on('error', handleError);
});

// JS Linter
gulp.task('jshint', function() {
  gulp.src(['static/app/**/*.js', 'static/assets/js/*.js'])
    .pipe(jshint()).on('error', handleError)
    .pipe(jshint.reporter('jshint-stylish')).on('error', handleError);
});

// JS Builder
gulp.task('build-js', function() {
  gulp.src('static/assets/js/*.js')
    .pipe(sourcemaps.init()).on('error', handleError)
      .pipe(uglify()).on('error', handleError)
      .pipe(rename({ suffix: '.min' })).on('error', handleError)
    .pipe(sourcemaps.write()).on('error', handleError)
    .pipe(gulp.dest('static/assets/js/dist')).on('error', handleError);
});

// NG Builder
gulp.task('build-ng', function() {
  gulp.src('static/app/**/*.js')
    .pipe(sourcemaps.init()).on('error', handleError)
      .pipe(concat('angular-app.min.js')).on('error', handleError)
      .pipe(uglify()).on('error', handleError)
    .pipe(sourcemaps.write()).on('error', handleError)
    .pipe(gulp.dest('static/assets/js/dist')).on('error', handleError);
});

// Image Optimizer
gulp.task('img-optimizer', function() {
gulp.src('static/assets/img/*')
  .pipe(imagemin({progressive: true, svgoPlugins: [{removeViewBox: false}], use: [pngquant()]})).on('error', handleError)
  .pipe(gulp.dest('static/assets/img')).on('error', handleError);
});



// Watcher
gulp.task('watch', function() {
  gulp.watch('static/assets/scss/**/*.scss', ['sass']);
  gulp.watch('static/assets/coffee/*.coffee', ['jscoffee']);
  gulp.watch(['static/app/**/*.js', 'static/assets/js/*.js'], ['jshint']);
  gulp.watch('static/assets/js/*.js', ['build-js']);
  gulp.watch('static/app/**/*.js', ['build-ng']);
});
