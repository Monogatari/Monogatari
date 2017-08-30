
/* global require */

"use strict";

const gulp = require("gulp");
const prettify = require("gulp-jsbeautifier");
const imagemin = require("gulp-imagemin");
const packageJson = require("./package.json");
const zip = require("gulp-zip");
const cssnano = require("gulp-cssnano");
const download = require("gulp-download-stream");
const runSequence = require("run-sequence");

gulp.task("default", () => {
	// place code for your default task here
});

gulp.task("prettify", () => {
	gulp.src(["./style/*.css", "!style/*.min.css"])
		.pipe(prettify({
			indent_level: 4,
			indent_char: "\t",
			indent_size: 1
		}))
		.pipe(gulp.dest("./style/"));

	gulp.src(["./*.html", "./*.js"])
		.pipe(prettify({
			indent_level: 4,
			indent_char: "\t",
			indent_size: 1
		}))
		.pipe(gulp.dest("./"));

	gulp.src(["./js/*.js", "!js/*.min.js"])
		.pipe(prettify({
			indent_level: 4,
			indent_char: "\t",
			indent_size: 1
		}))
		.pipe(gulp.dest("./js/"));
});

gulp.task("optimize", () => {
	gulp.src(["./img/**/*.jpg", "./img/**/*.jpeg", "./img/**/*.png", "./img/**/*.gif", "./img/**/*.svg"])
		.pipe(imagemin())
		.pipe(gulp.dest(function (file) {
			return file.base;
		}));
});

gulp.task("release", () => {
	return gulp.src(["./**", "!./**/.DS_Store", "!./**/.thumbs", "!./**/.gitignore", "!./**/.editorconfig",
		"!./**/.buildconfig", "!.git/**", "!node_modules/**", "!build/**", "!.git", "!node_modules", "!build"
	], {
		dot: true
	})
		.pipe(zip("Monogatari-v" + packageJson.version + ".zip"))
		.pipe(gulp.dest("dist"));
});

// Update Dependencies
gulp.task("download-deps", () => {

	// Artemis JS
	download("https://raw.githubusercontent.com/AegisFramework/Artemis/master/dist/artemis.min.js").pipe(gulp.dest("js/"));

	// jQuery
	download({
		file: "jquery.min.js",
		url: "https://code.jquery.com/jquery-3.2.1.min.js"
	}).pipe(gulp.dest("js/"));

	// Particles JS
	download("https://raw.githubusercontent.com/VincentGarreau/particles.js/master/particles.min.js").pipe(gulp.dest("js/"));

	// Animate CSS
	download({
		file: "animatelo.min.js",
		url: "https://raw.githubusercontent.com/gibbok/animatelo/master/dist/animatelo.min.js"
	}).pipe(gulp.dest("js/"));

	download({
		file: "animate.min.css",
		url: "https://raw.githubusercontent.com/daneden/animate.css/master/animate.css"
	}).pipe(gulp.dest("style/"));

	// CSS Shake
	download("https://raw.githubusercontent.com/elrumordelaluz/csshake/master/dist/csshake.min.css").pipe(gulp.dest("style/"));

	// Kayros
	download({
		file: "kayros.min.css",
		url: "https://raw.githubusercontent.com/AegisFramework/Kayros/master/dist/kayros.min.css"
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


gulp.task("download-monogatari", () => {

	// Monogatari CSS
	download("https://raw.githubusercontent.com/Hyuchia/Monogatari/master/style/monogatari.css").pipe(gulp.dest("style/"));

	// Monogatari JS
	download("https://raw.githubusercontent.com/Hyuchia/Monogatari/master/js/monogatari.js").pipe(gulp.dest("js/"));
});

gulp.task("update", () => {
	runSequence(["download-deps", "download-monogatari"]);
});