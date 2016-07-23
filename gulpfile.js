const gulp = require('gulp');
const prettify = require('gulp-jsbeautifier');
const imagemin = require('gulp-imagemin');
const packageJson = require('./package.json');

gulp.task('default', () => {
	// place code for your default task here
});

gulp.task('prettify', () => {
	gulp.src(['./style/*.css', '!style/*.min.css'])
		.pipe(prettify({
			indent_level: 4,
			indent_char: '\t',
			indent_size: 1
		}))
		.pipe(gulp.dest('./style/'));

	gulp.src(['./*.html', './*.js'])
		.pipe(prettify({
			indent_level: 4,
			indent_char: '\t',
			indent_size: 1
		}))
		.pipe(gulp.dest('./'))

	gulp.src(['./js/*.js', '!js/*.min.js'])
		.pipe(prettify({
			indent_level: 4,
			indent_char: '\t',
			indent_size: 1
		}))
		.pipe(gulp.dest('./js/'))
});

gulp.task('optimize', () => {
	gulp.src(['./img/**/*.jpg', './img/**/*.jpeg', './img/**/*.png', './img/**/*.gif', './img/**/*.svg'])
		.pipe(imagemin())
		.pipe(gulp.dest(function(file) {
			return file.base;
		}))
});

gulp.task('release', () => {
	gulp.src(['./img/**/*.jpg', './img/**/*.jpeg', './img/**/*.png', './img/**/*.gif', './img/**/*.svg'])
		.pipe(imagemin())
		.pipe(gulp.dest(function(file) {
			return file.base;
		}))
});