"use strict";

// The name of your game, no spaces or special characters.
var name = "Monogatari";

// The version of the cache, changing this will force everything to be cached
// again.
var version = "0.1.0";

var files = [

	// General Files
	"/",
	"manifest.json",

	// HTML Files
	// "index.html",

	// CSS Files
	"style/animate.min.css",
	"style/csshake.min.css",
	"style/font-awesome.min.css",
	"style/normalize.min.css",
	// "style/monogatari.css",
	// "style/main.css",

	// JavaScript Files
	"js/particles.min.js",
	"js/jquery.min.js",
	"js/artemis.min.js",
	"js/plugins.js",
	// js/monogatari.js",
	// js/strings.js",
	// js/options.js",
	// js/script.js",

	// Fonts
	"fonts/FontAwesome.otf",
	"fonts/fontawesome-webfont.eot",
	"fonts/fontawesome-webfont.svg",
	"fonts/fontawesome-webfont.ttf",
	"fonts/fontawesome-webfont.woff",
	"fonts/fontawesome-webfont.woff2",

	// App Images
	"img/favicon.ico",

	// Scene Images
	//"img/scenes/",

	// Character Images
	//"img/characters/",

	// Side Images
	//"img/characters/",

	// UI Images
	//"img/ui/",

	// Music Audio
	// "audio/music/",

	// Voice Audio
	// "audio/voice/"

	// Sound Audio
	// "audio/sound/"
];

self.addEventListener("install", function (event) {
	event.waitUntil(
		caches.open(`${name}-v${version}`).then(function (cache) {
			return cache.addAll(files);
		})
	);
});

self.addEventListener("activate", function (event) {
	event.waitUntil(
		caches.keys().then(function (keyList) {
			return Promise.all(keyList.map(function (key) {
				if (key !== `${name}-v${version}`) {
					return caches.delete(key);
				}
			}));
		})
	);

	return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
	if (event.request.method !== "GET") {
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
				return new Response("<h1>Service Unavailable</h1>", {
					status: 503,
					statusText: "Service Unavailable",
					headers: new Headers({
						"Content-Type": "text/html"
					})
				});
			}
		})
	);
});