const gulp = require('gulp');
const prettify = require('gulp-jsbeautifier');
const imagemin = require('gulp-imagemin');
const packageJson = require('./package.json');
const zip = require('gulp-zip');
const cssnano = require('gulp-cssnano');
const download = require("gulp-download-stream");

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
	return gulp.src(['./**', '!./**/.DS_Store', '!./**/.thumbs', '!./**/.gitignore', '!./**/.editorconfig',
					'!./**/.buildconfig', '!.git/**','!node_modules/**','!build/**', '!.git','!node_modules','!build'], {dot: true})
	.pipe(zip('Monogatari-v' + packageJson.version + '.zip'))
	.pipe(gulp.dest('dist'));
});

// Update Dependencies
gulp.task('download-deps', () => {

	// Aegis JS
    download("https://raw.githubusercontent.com/HyuchiaDiego/AegisJS/master/dist/aegis.min.js").pipe(gulp.dest("js/"));

    // jQuery
	download({
		file: "jquery.min.js",
		url: "https://code.jquery.com/jquery-3.1.0.min.js"
	}).pipe(gulp.dest("js/"));

	// Particles JS
	download("https://raw.githubusercontent.com/VincentGarreau/particles.js/master/particles.min.js").pipe(gulp.dest("js/"));

	// Animate CSS
	download({
		file: "animate.min.css",
		url: "https://raw.githubusercontent.com/daneden/animate.css/master/animate.css"
	}).pipe(gulp.dest("style/"));

	// CSS Shake
	download("https://raw.githubusercontent.com/elrumordelaluz/csshake/master/dist/csshake.min.css").pipe(gulp.dest("style/"));

	// Normalize CSS
	download({
		file: "normalize.min.css",
		url: "https://raw.githubusercontent.com/necolas/normalize.css/master/normalize.css"
	}).pipe(gulp.dest("style/"));

	// Font Awesome
    download("https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/css/font-awesome.min.css").pipe(gulp.dest("style/"));

	download({
		file: "FontAwesome.otf",
		url: "https://github.com/FortAwesome/Font-Awesome/blob/master/fonts/FontAwesome.otf?raw=true"
	}).pipe(gulp.dest("fonts/"));

	download({
		file: "fontawesome-webfont.eot",
		url: "https://github.com/FortAwesome/Font-Awesome/blob/master/fonts/fontawesome-webfont.eot?raw=true"
	}).pipe(gulp.dest("fonts/"));

	download({
		file: "fontawesome-webfont.ttf",
		url: "https://github.com/FortAwesome/Font-Awesome/blob/master/fonts/fontawesome-webfont.ttf?raw=true"
	}).pipe(gulp.dest("fonts/"));

	download({
		file: "fontawesome-webfont.woff",
		url: "https://github.com/FortAwesome/Font-Awesome/blob/master/fonts/fontawesome-webfont.woff?raw=true"
	}).pipe(gulp.dest("fonts/"));

	download({
		file: "fontawesome-webfont.woff2",
		url: "https://github.com/FortAwesome/Font-Awesome/blob/master/fonts/fontawesome-webfont.woff2?raw=true"
	}).pipe(gulp.dest("fonts/"));

	download("https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/fonts/fontawesome-webfont.svg").pipe(gulp.dest("fonts/"));
});

gulp.task('minify-deps', () => {
	gulp.src('style/animate.min.css')
	.pipe(cssnano())
	.pipe(gulp.dest("style/"));

	gulp.src('style/normalize.min.css')
	.pipe(cssnano())
	.pipe(gulp.dest("style/"));
});