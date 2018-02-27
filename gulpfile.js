
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
const eslint = require("gulp-eslint");
const stylelint = require("gulp-stylelint");
const htmlhint = require("gulp-htmlhint");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const closureCompiler = require("google-closure-compiler").gulp();

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
		file: "animate.min.css",
		url: "https://raw.githubusercontent.com/daneden/animate.css/master/animate.min.css"
	}).pipe(gulp.dest("style/"));

	// CSS Shake
	download("https://raw.githubusercontent.com/Monogatari/csshake/master/dist/csshake.min.css").pipe(gulp.dest("style/"));

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

gulp.task("lint:js", () => {
	return gulp.src(["./js/*.js", "!js/*.min.js"])
		.pipe(eslint({ fix: true }))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task("lint:css", () => {
	return gulp.src(["./style/*.css", "!style/*.min.css"])
		.pipe(stylelint({
			failAfterError: true,
			reporters: [{
				formatter: "string",
				console: true
			}]
		}));
});

gulp.task("lint:html", () => {
	return gulp.src("./*.html")
		.pipe(htmlhint())
		.pipe(htmlhint.reporter())
		.pipe(htmlhint.failAfterError());
});

gulp.task("lint", ["lint:js", "lint:css", "lint:html"]);

gulp.task("package:js", () => {
	return gulp.src([
		"js/pollyfill.min.js",
		"js/jquery.min.js",
		"js/particles.min.js",
		"js/typed.min.js",
		"js/artemis.min.js",
		"js/strings.js",
		"js/options.js",
		"js/storage.js",
		"js/script.js",
		"js/monogatari.js",
		"js/main.js"
	])
		.pipe(concat({ path: packageJson.name + ".js", stat: { mode: "0664" }, newLine: "\r\n"}))
		.pipe(closureCompiler({
			compilation_level: "WHITESPACE_ONLY",
			language_in: "ECMASCRIPT6_STRICT",
			language_out: "ECMASCRIPT5_STRICT",
			js_output_file: packageJson.name + ".min.js"
		}))
		.pipe(gulp.dest("build/"));
});

gulp.task("package:style", () => {
	return gulp.src([
		"style/cssshake.min.css",
		"style/animate.min.css",
		"style/font-awesome.min.css",
		"style/kayros.min.css",
		"style/monogatari.css",
		"style/main.css"
	])
		.pipe(concat({ path: packageJson.name + ".css", stat: { mode: "0664" }, newLine: "\r\n\r\n"}))
		.pipe(cssnano({zindex: false}))
		.pipe(rename({ extname: ".min.css" }))
		.pipe(gulp.dest("build/"));
});

gulp.task("package:misc", () => {
	return gulp.src([
		"./**",
		"!./**/.DS_Store",
		"!./**/.thumbs",
		"!./**/.md",
		"!./**/.gitignore",
		"!./**/.editorconfig",
		"!./**/.buildconfig",
		"!.git/**",
		"!node_modules/**",
		"!build/**",
		"!.git",
		"!node_modules",
		"!build",
		"!style",
		"!js",
		"!build/**",
		"!style/**",
		"!js/**"
	])
		.pipe(gulp.dest("build/"));
});

gulp.task("package", ["package:js", "package:style", "package:misc"]);