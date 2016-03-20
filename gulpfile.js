/**
 * Created by alexeykastyuk on 3/19/16.
 */
var gulp = require('gulp');
var server = require('gulp-express');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('compress_css', function () {
    return gulp.src('public/application/**/*.css')
            .pipe(cssmin())
            .pipe(concat('styles.min.css'))
            .pipe(gulp.dest('public/dist/'))
});

gulp.task('compress_js', function () {
     return gulp.src('public/application/**/*.js')
            .pipe(uglify())
            .pipe(concat('scripts.min.js'))
            .pipe(gulp.dest('public/dist/'));
});

gulp.task('default', function () {
    server.run(['server.js']);

    gulp.watch(['public/application/**/*.css'], ['compress_css']);
    gulp.watch(['public/application/**/*.js'], ['compress_js']);

    gulp.watch(['server.js', 'server/**/*'], [server.run])
});