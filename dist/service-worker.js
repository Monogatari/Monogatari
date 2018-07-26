'use strict';

// The name of your game, no spaces or special characters.
var name = 'Monogatari';

// The version of the cache, changing this will force everything to be cached
// again.
var version = '0.1.0';

var files = [

	// General Files
	'manifest.json',

	// Engine Files
	'engine/monogatari.css',
	'engine/monogatari.js',

	// HTML Files
	// 'index.html',

	// Style Sheets

	// 'style/main.css',

	// JavaScript Files
	'js/vendor/jquery.min.js',

	// 'js/options.js',
	// 'js/storage.js',
	// 'js/script.js',
	// 'js/main.js'

	// Fonts

	// App Images
	'assets/favicon.ico',
	'assets/icons/icon_48x48.png',
	'assets/icons/icon_60x60.png',
	'assets/icons/icon_70x70.png',
	'assets/icons/icon_76x76.png',
	'assets/icons/icon_96x96.png',
	'assets/icons/icon_128x128.png',
	'assets/icons/icon_150x150.png',
	'assets/icons/icon_152x152.png',
	'assets/icons/icon_167x167.png',
	'assets/icons/icon_180x180.png',
	'assets/icons/icon_192x192.png',
	'assets/icons/icon_310x310.png',
	'assets/icons/icon_512x512.png'

	// Scene Images
	//'assets/scenes/',

	// Character Images
	//'assets/characters/',

	// Side Images
	//'assets/characters/',

	// UI Images
	//'assets/ui/',

	// Music Audio
	// 'assets/music/',

	// Voice Audio
	// 'assets/voice/'

	// Sound Audio
	// 'assets/sound/'
];

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(`${name}-v${version}`).then(function (cache) {
			return cache.addAll (files);
		})
	);
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (keyList) {
			return Promise.all(keyList.map(function (key) {
				if (key !== `${name}-v${version}`) {
					return caches.delete (key);
				}
			}));
		})
	);

	return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
	if (event.request.method !== 'GET') {
		return;
	}

	event.respondWith(
		caches.match(event.request).then(function (cached) {
			var networked = fetch(event.request)
				.then(fetchedFromNetwork, unableToResolve)
				.catch(unableToResolve);
			return cached || networked;

			function fetchedFromNetwork (response) {
				var cacheCopy = response.clone();

				caches.open(`${name}-v${version}`).then(function add (cache) {
					cache.put(event.request, cacheCopy);
				});

				return response;
			}

			function unableToResolve () {
				return new Response(`
					<!DOCTYPE html><html lang=en><title>Service Unavailable</title><meta charset=UTF-8><meta content="width=device-width,initial-scale=1"name=viewport><style>html{width:100%;	height:100%}body{width:100%;height:100%;text-align:center;color:#545454;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Open Sans","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;margin:0}body>div{margin:0 auto;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);-moz-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);position:absolute;max-height:100%}h1{font-size:4em;font-weight:lighter}h2{font-size:2em;font-weight:lighter}</style><div><h1>Service Unavailable</h1><h2>Sorry, the server is currently unavailable or under maintenance, try again later.</h2></div>
				`, {
					status: 503,
					statusText: 'Service Unavailable',
					headers: new Headers({
						'Content-Type': 'text/html'
					})
				});
			}
		})
	);
});