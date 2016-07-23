// Declaration of jQuery for Electron's environment.
try {
	window.$ = window.jQuery = require('./js/jquery.min.js');
} catch (e) {

}