'use strict';

// The name of your game, no spaces or special characters.
var name = 'Monogatari';

// The version of the cache, changing this will force everything to be cached
// again.
var version = '0.1.0';

var files = [

	// General Files
	'manifest.json',

	// HTML Files
	// 'index.html',

	// Style Sheets
	'style/monogatari.css',
	// 'style/main.css',

	// JavaScript Files
	'js/jquery.min.js',
	'js/monogatari.js',
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
				return new Response('<h1>Service Unavailable</h1>', {
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