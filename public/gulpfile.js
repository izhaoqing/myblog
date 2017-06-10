var gulp = require('gulp'),
	less = require('gulp-less'),
	rename = require('gulp-rename'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	mincss = require('gulp-clean-css');

var lessFiles = [
	'admin/**/*.less',
	'index/**/*.less'
]

gulp.task('less', function () {
	gulp.src(lessFiles, { base: '.'})
	.pipe(plumber({
		errorHandler:notify.onError('Error: <%= error.message %>')
	}))
	.pipe(less())
	// .pipe(mincss())
	// .pipe(rename({
	// 	suffix:'.min'
	// }))
	.pipe(gulp.dest(''));
});

gulp.task('init', ['less']);

gulp.task('watch', function () {
	gulp.watch(lessFiles, ['less']);
});

