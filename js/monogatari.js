/**
 * ====================================
 * I N D E X
 * ====================================
 * 1)  Initialize Variables
 * 2)  Plugin Function Calls
 * 3)  Set Initial Settings
 * 4)  Localization
 * 5)  Electron Platform
 * 6)  Set iOS Conditions
 * 7)  Set Save and Load Slots
 * 8)  Save and Load Functions
 * 9)  Save and Load Events
 * 10)  Settings Event Handlers
 * 11) Storage
 * 12) Quick Start
 * 13) Service Workers
 * 14) Preload Assets
 * 15) Data-Action Event Handlers
 * 16) In-Game Event Handlers
 * 17) Engine Helper Functions
 * 18) Statements Functioning
 * ====================================
 **/
"use strict";

/**
 * ======================
 * Initialize Variables
 * ======================
 **/

/* global $_ */
/* global $_ready */
/* global characters */
/* global engine */
/* global images */
/* global messages */
/* global music */
/* global notifications */
/* global particles */
/* global require */
/* global particlesJS */
/* global pJSDom */
/* global Typed */
/* global scenes */
/* global script */
/* global settings */
/* global sound */
/* global storage */
/* global strings */
/* global videos */
/* global voice */

let label;
let game;
let textObject;
let playing = false;
let block = false;
let autoPlay = null;
let finishedTyping = false;
let deleteSlot;
let overwriteSlot;
const storageStructure = JSON.stringify(storage);

$_ready(function () {

	/**
	 * ======================
	 * Fixer functions
	 * ======================
	 **/

	function fixOptions () {
		fixSettings ();
		fixEngine ();
	}

	// Fill missing settings properties with the engine's defaults
	function fixSettings () {
		if (typeof settings.Resolution !== "string") {
			console.warn ("The 'Resolution' property is missing in the settings object, using default fallback.");
			settings.Resolution = "800x600";
		}

		if (typeof settings.TextSpeed !== "number") {
			console.warn ("The 'TextSpeed' property is missing in the settings object, using default fallback.");
			settings.TextSpeed = 20;
		}

		if (typeof settings.AutoPlaySpeed !== "number") {
			console.warn ("The 'AutoPlaySpeed' property is missing in the settings object, using default fallback.");
			settings.AutoPlaySpeed = 5;
		}

		Storage.set("Settings", JSON.stringify(settings));
	}

	function fixEngine () {
		if (typeof engine.ShowMenu !== "boolean") {
			console.warn ("The 'ShowMenu' property is missing in the engine object, using default (true) fallback.");
			engine.ShowMenu = true;
		}

		if (typeof engine.Preload !== "boolean") {
			console.warn ("The 'Preload' property is missing in the engine object, using default (true) fallback.");
			engine.Preload = true;
		}

		if (typeof engine.AutoSave !== "number") {
			console.warn ("The 'AutoSave' property is missing in the engine object, using default (0) fallback.");
			engine.AutoSave = 0;
		}

		if (typeof engine.AutoSaveLabel == "undefined") {
			console.warn("The 'AutoSaveLabel' property is missing in the engine object, using default ('AutoSave_') fallback.");
			engine.AutoSaveLabel = "AutoSave_";
		}

		if (typeof engine.ServiceWorkers !== "boolean") {
			console.warn("The 'ServiceWorkers' property is missing in the engine object, using default ('true') fallback.");
			engine.ServiceWorkers = true;
		}

		if (typeof engine.AspectRatio !== "string") {
			console.warn("The 'AspectRatio' property is missing in the engine object, using default ('16:9') fallback.");
			engine.AspectRatio = "16:9";
		}

		if (typeof engine.TypeAnimation !== "boolean") {
			console.warn("The 'TypeAnimation' property is missing in the engine object, using default ('true') fallback.");
			engine.TypeAnimation = true;
		}

		if (typeof engine.NarratorTypeAnimation !== "boolean") {
			console.warn("The 'NarratorTypeAnimation' property is missing in the engine object, using default ('true') fallback.");
			engine.NarratorTypeAnimation = true;
		}

		if (typeof engine.CenteredTypeAnimation !== "boolean") {
			console.warn("The 'CenteredTypeAnimation' property is missing in the engine object, using default ('true') fallback.");
			engine.CenteredTypeAnimation = true;
		}

		if (typeof engine.Particles !== "string") {
			console.warn("The 'Particles' property is missing in the engine object, using default ('') fallback.");
			engine.Particles = "";
		}

		if (typeof engine.ParticlesHistory !== "object") {
			console.warn("The 'ParticlesHistory' property is missing in the engine object, using default ('[]') fallback.");
			engine.ParticlesHistory = [];
		}

		if (typeof engine.SceneElementsHistory !== "object") {
			console.warn("The 'SceneElementsHistory' property is missing in the engine object, using default ('[]') fallback.");
			engine.SceneElementsHistory = [];
		}
	}

	/**
	 * ======================
	 * Game Objects
	 * ======================
	 **/

	const ambientPlayer = document.querySelector("[data-component='ambient']");
	const musicPlayer = document.querySelector("[data-component='music']");
	const soundPlayer = document.querySelector("[data-component='sound']");
	const videoPlayer = document.querySelector("[data-ui='player']");
	const voicePlayer = document.querySelector("[data-component='voice']");

	const maxTextSpeed = parseInt($_("[data-action='set-text-speed']").property ("max"));
	const maxAutoPlaySpeed = parseInt($_("[data-action='set-auto-play-speed']").property ("max"));

	/**
	 * ======================
	 * Set Initial Settings
	 * ======================
	 **/

	const local_settings = Storage.get("Settings");

	// Set the initial settings if they don't exist or load them.
	if (local_settings === null || local_settings == "") {
		Storage.set("Settings", JSON.stringify(settings));
	} else {
		settings = Object.assign({}, settings, JSON.parse(local_settings));
	}

	fixOptions ();

	// Disable the load and save slots in case Local Storage is not supported.
	if (!window.localStorage) {
		$_("[data-ui='slots']").html(`<p>${getLocalizedString("LocalStorageWarning")}</p>`);
	}

	if (typeof Typed == "undefined") {
		console.error ("Typed library not found, dialogs will not be shown.");
	}

	if (typeof engine.TypeAnimation !== "undefined") {
		if (engine.TypeAnimation === false) {
			$_("[data-settings='text-speed']").hide ();
		}
	}

	// Set the game language or hide the option if the game is not multilingual
	if (engine.MultiLanguage) {
		game = script[settings.Language];
		$_("[data-action='set-language']").value(settings.Language);
		$_("[data-string]").each(function (element) {
			const string_translation = strings[$_("[data-action='set-language']").value()][$_(element).data("string")];
			if (typeof string_translation !== "undefined" && string_translation != "") {
				$_(element).text(string_translation);
			}
		});
	} else {
		game = script;
		$_("[data-settings='language']").hide();
	}

	// Set the label in which the game will start
	label = game[engine.Label];

	// Set the volume of all the media components
	musicPlayer.volume = settings.Volume.Music;
	ambientPlayer.volume = settings.Volume.Music;
	voicePlayer.volume = settings.Volume.Voice;
	soundPlayer.volume = settings.Volume.Sound;
	document.querySelector("[data-target='music']").value = settings.Volume.Music;
	document.querySelector("[data-target='voice']").value = settings.Volume.Voice;
	document.querySelector("[data-target='sound']").value = settings.Volume.Sound;

	document.querySelector("[data-action='set-text-speed']").value = settings.TextSpeed;
	document.querySelector("[data-action='set-auto-play-speed']").value = settings.AutoPlaySpeed;

	// Set all the dynamic backgrounds of the data-background property
	$_("[data-background]").each(function (element) {
		if ($_(element).data("background").indexOf(".") > -1) {
			const src = "url('" + $_(element).data("background") + "') center / cover no-repeat";
			$_(element).style("background", src);
		} else {
			$_(element).style("background", $_(element).data("background"));
		}
	});

	// Play the main menu song
	playAmbient();

	/**
	 * ======================
	 * Library Settings
	 * ======================
	 **/

	const typedConfiguration = {
		strings: [],
		typeSpeed: settings.TextSpeed,
		fadeOut: true,
		loop: false,
		showCursor: false,
		contentType: "html",
		preStringTyped: function () {
			finishedTyping = false;
		},
		onStringTyped: function () {
			if (autoPlay !== null) {
				autoPlay = setTimeout (function () {
					if (canProceed() && finishedTyping) {
						hideCentered();
						shutUp();
						next ();
					}
				}, settings.AutoPlaySpeed * 1000);
			}

			finishedTyping = true;
		},
		onDestroy () {
			finishedTyping = true;
		}
	};

	/**
	 * ======================
	 * Localization
	 * ======================
	 **/

	function getLocalizedString (string) {
		return strings[settings.Language][string];
	}

	// Set the initial language translations
	$_("[data-string]").each(function (element) {
		$_(element).text(getLocalizedString($_(element).data("string")));
	});


	/**
	 * ======================
	 * Electron Platform
	 * ======================
	 **/

	function isElectron () {
		return window && window.process && window.process.type;
	}

	// Set the electron quit handler.
	if (isElectron()) {
		const remote = require("electron").remote;
		const win = remote.getCurrentWindow();

		try {
			window.$ = window.jQuery = require("./js/jquery.min.js");
		} catch (e) {
			console.warn ("jQuery could not be loaded.");
		}

		$_("[data-action='set-resolution']").value(settings.Resolution);

		window.addEventListener("beforeunload", function (event) {
			event.preventDefault();
			$_("[data-notice='exit']").addClass("active");
		});

		if (!win.isResizable()) {
			if (typeof engine.AspectRatio != "undefined") {
				const aspectRatio = engine.AspectRatio.split(":");
				const aspectRatioWidth = parseInt(aspectRatio[0]);
				const aspectRatioHeight = parseInt(aspectRatio[1]);
				win.setResizable(true);
				const minSize = win.getMinimumSize();
				const {width, height} = remote.screen.getPrimaryDisplay().workAreaSize;
				win.setResizable(false);

				for (let i = 0; i < 488; i+=8) {
					const calculatedWidth = aspectRatioWidth*i;
					const calculatedHeight = aspectRatioHeight*i;

					if (calculatedWidth >= minSize[0] && calculatedHeight >= minSize[1] && calculatedWidth <= width && calculatedHeight <= height) {
						$_("[data-action='set-resolution']").append(`<option value="${calculatedWidth}x${calculatedHeight}">${getLocalizedString("Windowed")} ${calculatedWidth}x${calculatedHeight}</option>`);
					}
				}

				$_("[data-action='set-resolution']").append(`<option value="fullscreen">${getLocalizedString("FullScreen")}</option>`);

				if (typeof settings.Resolution != "undefined") {
					changeWindowResolution (settings.Resolution);
				}
				$_("[data-action='set-resolution']").change(function () {
					const size = $_("[data-action='set-resolution']").value();
					changeWindowResolution (size);
				});
			} else {
				$_("[data-settings='resolution']").hide();
				win.setResizable(true);
			}
		} else {
			$_("[data-settings='resolution']").hide();
		}

	} else {
		$_("[data-platform='electron']").hide();
	}

	function changeWindowResolution (resolution) {
		if (isElectron()) {
			const remote = require("electron").remote;
			const win = remote.getCurrentWindow();
			const {width, height} = remote.screen.getPrimaryDisplay().workAreaSize;
			if (resolution) {
				win.setResizable(true);

				if (resolution == "fullscreen" && !win.isFullScreen() && win.isFullScreenable ()) {
					win.setFullScreen(true);
					settings.Resolution = resolution;
					Storage.set("Settings", JSON.stringify(settings));
				} else if (resolution.indexOf("x") > -1) {
					win.setFullScreen(false);
					const size = resolution.split("x");
					const chosenWidth = parseInt(size[0]);
					const chosenHeight = parseInt(size[1]);

					if (chosenWidth <= width && chosenHeight <= height) {
						win.setSize(chosenWidth, chosenHeight, true);
						settings.Resolution = resolution;
						Storage.set("Settings", JSON.stringify(settings));
					}
				}
				win.setResizable(false);
			}
		}
	}

	/**
	 * =====================
	 * Cordova Platform
	 * =====================
	 **/


	function isCordova () {
		return !!window.cordova;
	}

	/**
	 * ======================
	 * Set iOS Conditions
	 * ======================
	 **/

	// Disable audio settings in iOS since they are not supported
	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		// iOS handles the volume using the system volume, therefore there is now way to
		// handle each of the sound sources individually and as such, this is disabled.
		$_("[data-settings='audio']").html(`<p>${getLocalizedString("iOSAudioWarning")}</p>`);
	}

	/**
	 * =======================
	 * Set Save and Load Slots
	 * =======================
	 **/

	// Get's the highest number currently available as a slot id (Save_{?})
	function getMaxSlotId () {
		const savedData = Object.keys(localStorage);

		let max = 1;
		for (const saveKey of savedData) {
			if (saveKey.indexOf (engine.SaveLabel) === 0) {
				const number = parseInt(saveKey.split (engine.SaveLabel)[1]);
				if (number > max) {
					max = number;
				}
			}
		}
		return max;
	}

	function addSlot (i, data) {
		const name = data.Name ? data.Name : data.Date;
		if (typeof scenes[data.Engine.Scene] !== "undefined") {

			$_("[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots']").append(`<figure data-load-slot='${i}' class='col xs6 m4 l3 xl3 animated flipInX'><button class='fa fa-close' data-delete='${i}'></button><img src='img/scenes/${scenes[data.Engine.Scene]}' alt=''><figcaption>` + getLocalizedString("Load") + ` #${i} <small>${name}</small></figcaption></figure>`);

			$_("[data-menu='save'] [data-ui='slots']").append(`<figure data-save='${i}' class='col xs6 m4 l3 xl3'><button class='fa fa-close' data-delete='${i}'></button><img src='img/scenes/${scenes[data.Engine.Scene]}' alt=''><figcaption>${getLocalizedString("Overwrite")} #${i}<small>${name}</small></figcaption></figure>`);

		} else {
			$_("[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots']").append(`<figure data-load-slot='${i}' class='col xs6 m4 l3 xl3 animated flipInX'><button class='fa fa-close' data-delete=${i}></button><figcaption>` + getLocalizedString("Load") + ` #${i} <small>${name}</small></figcaption></figure>`);

			$_("[data-menu='save'] [data-ui='slots']").append(`<figure data-save='${i}' class='col xs6 m4 l3 xl3'><figcaption><button class='fa fa-close' data-delete=${i}></button>${getLocalizedString("Overwrite")} #${i}<small>${name}</small></figcaption></figure>`);
		}
	}

	function addAutoSlot (i, data) {
		const name = data.Name ? data.Name : data.Date;

		if (typeof scenes[data.Engine.Scene] !== "undefined") {
			$_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").append(`<figure data-load-slot='${i}' class='col xs6 m4 l3 xl3 animated flipInX'><button class='fa fa-close' data-delete=${i}></button><img src='img/scenes/${scenes[data.Engine.Scene]}' alt=''><figcaption>` + getLocalizedString("Load") + ` #${i} <small>${name}</small></figcaption></figure>`);
		} else {
			$_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").append(`<figure data-load-slot='${i}' class='col xs6 m4 l3 xl3 animated flipInX'><button class='fa fa-close' data-delete=${i}></button><figcaption>` + getLocalizedString("Load") + ` #${i} <small>${name}</small></figcaption></figure>`);
		}
	}

	function setAutoSlots () {
		if (!window.localStorage) {
			return false;
		}

		$_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").html("");
		const savedData = Object.keys(localStorage).filter(function (key) {
			return key.indexOf (engine.AutoSaveLabel) == 0;
		}).sort (function (a, b) {
			const aNumber = parseInt (a.split (engine.AutoSaveLabel)[1]);
			const bNumber = parseInt (b.split (engine.AutoSaveLabel)[1]);

			if (aNumber > bNumber) {
				return 1;
			} else if (aNumber < bNumber) {
				return -1;
			} else {
				return 0;
			}
		});

		for (let i = 0; i < savedData.length; i++) {
			const label = savedData[i];
			if (label.indexOf (engine.AutoSaveLabel) === 0) {
				const slot = Storage.get (savedData[i]);
				const id = label.split (engine.AutoSaveLabel)[1];
				if (slot !== null && slot !== "") {
					addAutoSlot (id, JSON.parse(slot));
				}
			}
		}

		// Check if there are no Auto Saved games.
		if ($_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").html().trim() == "") {
			$_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").html(`<p>${getLocalizedString("NoAutoSavedGames")}</p>`);
		}
	}

	// Create all save and load slots
	function setSlots () {
		if (!window.localStorage) {
			return false;
		}

		$_("[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots']").html("");
		$_("[data-menu='save'] [data-ui='slots']").html("");

		$_("[data-menu='save'] [data-input='slotName']").value (niceDateTime ());

		const savedData = Object.keys(localStorage).filter(function (key) {
			return key.indexOf (engine.SaveLabel) == 0;
		}).sort (function (a, b) {
			const aNumber = parseInt (a.split (engine.SaveLabel)[1]);
			const bNumber = parseInt (b.split (engine.SaveLabel)[1]);
			if (aNumber > bNumber) {
				return 1;
			} else if (aNumber < bNumber) {
				return -1;
			} else {
				return 0;
			}
		});

		for (let i = 0; i < savedData.length; i++) {
			const label = savedData[i];
			const slot = Storage.get(label);
			const id = label.split (engine.SaveLabel)[1];
			if (slot !== null && slot !== "") {
				addSlot (id, JSON.parse (slot));
			}
		}

		// Check if there are no Saved games.
		if ($_("[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots']").html().trim() == "") {
			$_("[data-menu='load'] [data-ui='slots']").html(`<p>${getLocalizedString("NoSavedGames")}</p>`);
		}
		setAutoSlots ();
	}

	setSlots();

	/**
	 * =======================
	 * Save and Load Functions
	 * =======================
	 **/

	function niceDate () {
		return new Date ().toLocaleDateString ();
	}

	function niceDateTime () {
		return new Date ().toLocaleString ();
	}

	function newSave (name) {
		// Check if the player is actually playing
		if (playing) {
			document.body.style.cursor = "wait";

			// Get a list of all the images being shown in screen except the
			// face images so they can be shown next time the slot is loaded
			let show = "";
			$_("#game img:not([data-ui='face']):not([data-visibility='invisible'])").each(function (element) {
				show += element.outerHTML.replace(/"/g, "'") + ",";
			});

			// Build the save slot data with the current state of every
			// important object
			const saveData = {
				"Name": name,
				"Date": niceDateTime (),
				"Engine": engine,
				"Show": show,
				"Label": engine.Label,
				"Storage": storage
			};
			const id = getMaxSlotId () + 1;
			Storage.set (engine.SaveLabel + id, JSON.stringify(saveData));
			addSlot (id, saveData );
			document.body.style.cursor = "auto";
		}
	}

	function autoSave (id, slot) {
		if (playing) {
			document.body.style.cursor = "wait";

			// Get a list of all the images being shown in screen except the
			// face images so they can be shown next time the slot is loaded
			let show = "";
			$_("#game img:not([data-ui='face']):not([data-visibility='invisible'])").each(function (element) {
				show += element.outerHTML.replace(/"/g, "'") + ",";
			});

			const name = niceDateTime ();

			// Build the save slot data with the current state of every
			// important object
			const saveData = {
				"Name": name,
				"Date": name,
				"Engine": engine,
				"Show": show,
				"Label": engine.Label,
				"Storage": storage
			};

			Storage.set (slot, JSON.stringify(saveData));
			$_(`[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots'] [data-load-slot='${id}'] small`).text (name);
			$_(`[data-menu='save'] [data-ui='autoSaveSlots'] [data-ui='slots'] [data-save='${id}'] small`).text (name);
			document.body.style.cursor = "auto";
		}
	}

	function saveToSlot (id, slot, customName) {
		// Check if the player is actually playing
		if (playing) {
			document.body.style.cursor = "wait";

			// Get a list of all the images being shown in screen except the
			// face images so they can be shown next time the slot is loaded
			let show = "";
			$_("#game img:not([data-ui='face']):not([data-visibility='invisible'])").each(function (element) {
				show += element.outerHTML.replace(/"/g, "'") + ",";
			});

			// Get the name of the Slot if it exists or use the current date.
			let data = Storage.get (slot);

			let name;

			if (data !== null && data !== "") {
				data = JSON.parse (data);
				if (data.Name !== null && data.Name !== "" && typeof data.Name !== "undefined") {
					name = data.Name;
				} else {
					name = niceDateTime ();
				}
			} else {
				name = niceDateTime ();
			}

			if (typeof customName !== "undefined") {
				name = customName;
			}
			// Build the save slot data with the current state of every
			// important object
			const saveData = {
				"Name": name,
				"Date": niceDateTime (),
				"Engine": engine,
				"Show": show,
				"Label": engine.Label,
				"Storage": storage
			};

			Storage.set (slot, JSON.stringify(saveData));
			$_(`[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots'] [data-load-slot='${id}'] small`).text (name);
			$_(`[data-menu='save'] [data-ui='slots'] [data-save='${id}'] small`).text (name);
			document.body.style.cursor = "auto";
		}
	}

	function loadFromSlot (slot) {
		document.body.style.cursor = "wait";
		playing = true;

		resetGame ();

		$_("section").hide();
		$_("#game").show();
		const data = JSON.parse(Storage.get(slot));
		engine = Object.assign({}, engine, {
			"Label": data.Engine.Label,
			"Song": data.Engine.Song,
			"Sound": data.Engine.Sound,
			"Scene": data.Engine.Scene,
			"Particles": data.Engine.Particles,
			"Step": data.Engine.Step,
			"MusicHistory": data.Engine.MusicHistory,
			"SoundHistory": data.Engine.SoundHistory,
			"ImageHistory": data.Engine.ImageHistory,
			"CharacterHistory": data.Engine.CharacterHistory,
			"SceneHistory": data.Engine.SceneHistory,
			"SceneElementsHistory": data.Engine.SceneElementsHistory,
			"ParticlesHistory": data.Engine.ParticlesHistory
		});
		fixEngine ();
		storage = Object.assign({}, JSON.parse(storageStructure), data.Storage);

		label = game[data.Label];

		for (const i in data.Show.split(",")) {
			if (data.Show.split(",")[i].trim() != "") {
				$_("#game").append(data.Show.split(",")[i]);
			}
		}

		$_("[data-ui='background']").fadeOut(200, function () {

			if (typeof scenes[data.Engine.Scene] !== "undefined") {
				$_("[data-ui='background']").style("background", "url(img/scenes/" + scenes[data.Engine.Scene] + ") center / cover no-repeat");
			} else {
				$_("[data-ui='background']").style("background", data.Engine.Scene);
			}

			$_("[data-ui='background']").fadeIn(200);
		});

		if (engine.Song != "") {
			const parts = engine.Song.split (" ");
			if (parts[1] == "music") {

				if (parts[3] == "loop") {
					musicPlayer.setAttribute("loop", "");
				} else if (parts[3] == "noloop") {
					musicPlayer.removeAttribute("loop");
				}

				if (typeof music !== "undefined") {
					if (typeof music[parts[2]] != "undefined") {
						musicPlayer.setAttribute("src", "audio/music/" + music[parts[2]]);
					} else {
						musicPlayer.setAttribute("src", "audio/music/" + parts[2]);
					}
				} else {
					musicPlayer.setAttribute("src", "audio/music/" + parts[2]);
				}

				musicPlayer.play();
			}
		}

		if (engine.Sound != "") {
			const parts = engine.Sound.split (" ");
			if (parts[1] == "sound") {
				if (parts[3] == "loop") {
					soundPlayer.setAttribute("loop", "");
				} else if (parts[3] == "noloop") {
					soundPlayer.removeAttribute("loop");
				}

				if (typeof sound !== "undefined") {
					if (typeof sound[parts[2]] != "undefined") {
						soundPlayer.setAttribute("src", "audio/sound/" + sound[parts[2]]);
					} else {
						soundPlayer.setAttribute("src", "audio/sound/" + parts[2]);
					}
				} else {
					soundPlayer.setAttribute("src", "audio/sound/" + parts[2]);
				}

				soundPlayer.play();
			}
		}

		if (engine.Particles != "" && typeof engine.Particles == "string") {
			if (typeof particles[engine.Particles] !== "undefined") {
				particlesJS (particles[engine.Particles]);
			}
		}

		$_("#game").show();
		analyseStatement(label[engine.Step]);
		document.body.style.cursor = "auto";
	}

	/**
	 * =======================
	 * Save and Load Events
	 * =======================
	 **/

	// Load a saved game slot when it is pressed
	$_("[data-menu='load'] [data-ui='saveSlots']").on("click", "figcaption, img", function () {
		loadFromSlot (engine.SaveLabel + $_(this).parent().data("loadSlot"));
	});

	// Load an autosaved game slot when it is pressed
	$_("[data-menu='load'] [data-ui='autoSaveSlots']").on("click", "figcaption, img", function () {
		loadFromSlot (engine.AutoSaveLabel + $_(this).parent().data("loadSlot"));
	});

	// Save to slot when a slot is pressed.
	$_("[data-menu='save']").on("click", "figcaption, img", function () {
		overwriteSlot = $_(this).parent ().data ("save");
		const data = JSON.parse(Storage.get (engine.SaveLabel + overwriteSlot));

		if (typeof data.Name !== "undefined") {
			$_("[data-notice='slot-overwrite'] input").value (data.Name);
		} else {
			$_("[data-notice='slot-overwrite'] input").value (data.Date);
		}
		$_("[data-notice='slot-overwrite']").addClass ("active");
	});

	$_("[data-menu='save']").on("click", "small", function () {
		overwriteSlot = $_(this).parent ().parent ().data ("save");
		const data = JSON.parse(Storage.get (engine.SaveLabel + overwriteSlot));

		if (typeof data.Name !== "undefined") {
			$_("[data-notice='slot-overwrite'] input").value (data.Name);
		} else {
			$_("[data-notice='slot-overwrite'] input").value (data.Date);
		}
		$_("[data-notice='slot-overwrite']").addClass ("active");
	});

	$_("[data-menu='save'], [data-menu='load']").on("click", "[data-delete]", function () {
		deleteSlot = $_(this).data ("delete");
		const data = JSON.parse(Storage.get (engine.SaveLabel + deleteSlot));
		if (typeof data.Name !== "undefined") {
			$_("[data-notice='slot-deletion'] small").text (data.Name);
		} else {
			$_("[data-notice='slot-deletion'] small").text (data.Date);
		}

		$_("[data-notice='slot-deletion']").addClass ("active");
	});

	// Auto Save
	let currentAutoSaveSlot = 1;
	if (engine.AutoSave != 0 && typeof engine.AutoSave == "number") {
		setInterval(function () {
			autoSave (currentAutoSaveSlot, engine.AutoSaveLabel + currentAutoSaveSlot);

			if (currentAutoSaveSlot == engine.Slots) {
				currentAutoSaveSlot = 1;
			} else {
				currentAutoSaveSlot += 1;
			}
			setAutoSlots ();

		}, engine.AutoSave * 60000);
	} else {
		$_("[data-menu='load'] [data-ui='autoSaveSlots']").hide();
	}

	/**
	 * =======================
	 * Settings Event Handlers
	 * =======================
	 **/

	// Volume bars listeners
	$_("[data-action='set-volume']").on("change mouseover", function () {
		const v = document.querySelector("[data-component='" + $_(this).data("target") + "']");
		const value = $_(this).value();

		switch ($_(this).data("target")) {
			case "music":
				ambientPlayer.volume = value;
				v.volume = value;
				settings.Volume.Music = value;
				break;

			case "voice":
				v.volume = value;
				settings.Volume.Voice = value;
				break;

			case "sound":
				v.volume = value;
				settings.Volume.Sound = value;
				break;
		}
		Storage.set("Settings", JSON.stringify(settings));
	});

	$_("[data-action='set-text-speed']").on("change mouseover", function () {
		const value =  maxTextSpeed - parseInt($_(this).value());
		typedConfiguration.typeSpeed = value;
		settings.TextSpeed = value;
		Storage.set("Settings", JSON.stringify(settings));
	});

	$_("[data-action='set-auto-play-speed']").on("change mouseover", function () {
		const value = maxAutoPlaySpeed - parseInt($_(this).value());
		settings.AutoPlaySpeed = value;
		Storage.set("Settings", JSON.stringify(settings));
	});

	// Language select listener
	$_("[data-action='set-language']").change(function () {
		settings.Language = $_("[data-action='set-language']").value();
		game = script[settings.Language];
		label = game[engine.Label];
		Storage.set("Settings", JSON.stringify(settings));

		$_("[data-string]").each(function (element) {
			$_(element).text(strings[$_("[data-action='set-language']").value()][$_(element).data("string")]);
		});

		setSlots();
	});

	// Fix for select labels
	$_("[data-select]").click(function () {
		const e = document.createEvent("MouseEvents");
		e.initMouseEvent("mousedown");
		$_("[data-action='" + $_(this).data("select") + "']").get(0).dispatchEvent(e);
	});

	/**
	 * =======================
	 * Storage
	 * =======================
	 **/

	// Retrieve data from the storage variable
	function getData (data) {
		if (typeof storage != "undefined") {
			const path = data.split(".");

			data = storage[path[0]];
			for (let i = 1; i < path.length; i++) {
				data = data[path[i]];
			}
			return data;
		} else {
			console.error("The storage object is not defined.");
		}
	}

	/**
	 * ==========================
	 * Game Quick Start
	 * ==========================
	 **/

	// Start game automatically withouth going trough the main menu
	function showMainMenu () {
		if (!engine.ShowMenu) {
			stopAmbient();
			playing = true;
			$_("section").hide();
			$_("#game").show();
			analyseStatement(label[engine.Step]);
		} else {
			$_("[data-menu='main']").show();
		}
	}

	/**
	 * ==========================
	 * Service Workers
	 * ==========================
	 **/

	if (!isElectron() && !isCordova()) {
		if ("serviceWorker" in navigator && engine.ServiceWorkers) {
			if (location.protocol.indexOf ("http") > -1) {
				navigator.serviceWorker.register("service-worker.js");
			} else {
				console.warn ("Service Workers are available only when serving your files through a server, once you upload your game this warning will go away. You can also try using a simple server like this one for development: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/");
			}
		} else {
			console.warn("Service Workers are not available in this browser or have been disabled in the engine configuration.");
		}
	}

	/**
	 * ==========================
	 * Preload Assets
	 * ==========================
	 **/

	function preloadImage (src) {
		return new Promise(function (resolve, reject) {
			const image = new Image();
			image.onload  = function () {
				$_("[data-ui='load-progress']").value(parseInt($_("[data-ui='load-progress']").value()) + 1);
				resolve ();
			};
			image.onerror = function (e) {
				$_("[data-ui='load-progress']").value(parseInt($_("[data-ui='load-progress']").value()) + 1);
				reject (e);
			};
			image.src = src;
		});
	}


	function preloadAudio (src) {
		return Request.get(src, null, "blob").then(function () {
			$_("[data-ui='load-progress']").value(parseInt($_("[data-ui='load-progress']").value()) + 1);
		}).catch(function () {
			$_("[data-ui='load-progress']").value(parseInt($_("[data-ui='load-progress']").value()) + 1);
		});
	}

	const preloadPromises = [];
	let assetCount = 0;
	if (engine.Preload && !isElectron() && !isCordova()) {
		// Show loading screen
		$_("[data-menu='loading']").show();

		// Start by loading the image assets
		if (typeof scenes == "object") {
			assetCount += Object.keys(scenes).length;
			for (const i in scenes) {
				preloadPromises.push(preloadImage("img/scenes/" + scenes[i]));
			}
		}

		if (typeof characters == "object") {
			for (const i in characters) {
				let directory = "";
				if (typeof characters[i].Directory != "undefined") {
					directory = characters[i].Directory + "/";
				}

				if (typeof characters[i].Images != "undefined") {
					assetCount += Object.keys(characters[i].Images).length;
					for (const j in characters[i].Images) {
						preloadPromises.push(preloadImage("img/characters/" + directory + characters[i].Images[j]));
					}
				}

				if (typeof characters[i].Side != "undefined") {
					assetCount += Object.keys(characters[i].Side).length;
					for (const k in characters[i].Side) {
						preloadPromises.push(preloadImage("img/characters/" + directory + characters[i].Side[k]));
					}
				}
			}
		}

		if (typeof images == "object") {
			assetCount += Object.keys(images).length;
			for (const i in images) {
				preloadPromises.push(preloadImage("img/" + images[i]));
			}
		}

		// Load the audio assets
		if (typeof music == "object") {
			assetCount += Object.keys(music).length;
			for (const i in music) {
				preloadPromises.push(preloadAudio("audio/music/" + music[i]));
			}
		}

		if (typeof voice == "object") {
			assetCount += Object.keys(voice).length;
			for (const i in voice) {
				preloadPromises.push(preloadAudio("audio/voice/" + voice[i]));
			}
		}

		if (typeof sound == "object") {
			assetCount += Object.keys(sound).length;
			for (const i in sound) {
				preloadPromises.push(preloadAudio("audio/sound/" + sound[i]));
			}
		}

		$_("[data-ui='load-progress']").attribute("max", assetCount);
		Promise.all(preloadPromises).then(function () {
			$_("[data-menu='loading']").fadeOut(400, function () {
				$_("[data-menu='loading']").hide();
			});
			showMainMenu ();

		}).catch (function (e) {
			console.error (e);
		});

	} else {
		showMainMenu ();
	}

	/**
	 * ==========================
	 * Data-Action Event Handlers
	 * ==========================
	 **/

	$_("[data-action]").click(function (event) {

		switch ($_(this).data("action")) {

			case "open-menu":
				$_("section").hide();

				if ($_(this).data("open") == "save") {
					$_("[data-menu='save'] [data-input='slotName']").value (niceDateTime ());
				}

				$_("[data-menu='" + $_(this).data("open") + "']").show();

				break;

			case "pause":
				break;

			case "start":
				stopAmbient();
				playing = true;
				$_("section").hide();
				$_("#game").show();
				analyseStatement(label[engine.Step]);
				break;

			case "close":
				$_("[data-ui='" + $_(this).data("close") + "']").removeClass("active");
				break;

			case "close-video":
				stopVideo();
				break;

			case "quit":
				$_("[data-notice='exit']").removeClass("active");
				endGame();
				break;

			case "dismiss-notice":
				$_("[data-notice]").removeClass("active");
				break;

			case "end":
				$_("[data-notice='exit']").addClass("active");
				break;

			case "distraction-free":
				if ($_(this).hasClass("fa-eye")) {
					$_(this).removeClass("fa-eye");
					$_(this).addClass("fa-eye-slash");
					$_(this).parent ().find ("[data-string]").text (getLocalizedString ("Show"));
					$_("[data-ui='quick-menu']").addClass ("transparent");
					$_("[data-ui='text']").hide();
				} else if ($_(this).hasClass("fa-eye-slash")) {
					$_(this).removeClass("fa-eye-slash");
					$_(this).addClass("fa-eye");
					$_(this).parent ().find ("[data-string]").text (getLocalizedString ("Hide"));
					$_("[data-ui='quick-menu']").removeClass ("transparent");
					$_("[data-ui='text']").show();
				} else if ($_(this).text () === getLocalizedString ("Show")) {
					$_(this).text (getLocalizedString("Hide"));
					$_(this).parent ().find (".fa").removeClass ("fa-eye-slash");
					$_(this).parent ().find (".fa").addClass ("fa-eye");
						$_("[data-ui='quick-menu']").removeClass ("transparent");
					$_("[data-ui='text']").show ();
				} else if ($_(this).text () === getLocalizedString ("Hide")) {
					$_(this).text (getLocalizedString ("Show"));
					$_(this).parent ().find (".fa").removeClass ("fa-eye");
					$_(this).parent ().find (".fa").addClass ("fa-eye-slash");
					$_("[data-ui='quick-menu']").addClass ("transparent");
					$_("[data-ui='text']").hide ();
				}
				break;

			case "auto-play":
				if ($_(this).hasClass("fa-play-circle")) {
					$_(this).removeClass("fa-play-circle");
					$_(this).addClass("fa-stop-circle");
					autoPlay = setTimeout (function () {
						if (canProceed() && finishedTyping) {
							hideCentered();
							shutUp();
							next ();
						}
					}, settings.AutoPlaySpeed * 1000);
				} else if ($_(this).hasClass("fa-stop-circle")) {
					$_(this).removeClass("fa-stop-circle");
					$_(this).addClass("fa-play-circle");
					clearTimeout (autoPlay);
					autoPlay = null;
				} else if ($_(this).text () === getLocalizedString ("AutoPlay")) {
					$_(this).text (getLocalizedString("Stop"));
					autoPlay = setTimeout(function () {
						if (canProceed() && finishedTyping) {
							hideCentered();
							shutUp();
							next ();
						}
					}, settings.AutoPlaySpeed * 1000);
				} else if ($_(this).text () === getLocalizedString ("Stop")) {
					$_(this).text (getLocalizedString ("AutoPlay"));
					clearTimeout (autoPlay);
					autoPlay = null;
				}
				break;

			case "jump":
				stopAmbient();
				label = game[$_(this).data("jump")];
				engine.Step = 0;
				playing = true;
				$_("section").hide();
				$_("#game").show();
				analyseStatement(label[engine.Step]);
				break;

			case "save":
				var slotName = $_("[data-menu='save'] [data-input='slotName']").value ().trim ();
				if (slotName !== "") {
					newSave (slotName);
				}
				break;

			case "delete-slot":
				Storage.remove (engine.SaveLabel + deleteSlot);
				$_(`[data-load-slot='${deleteSlot}'], [data-save='${deleteSlot}']`).remove ();
				deleteSlot = null;
				$_("[data-notice='slot-deletion']").removeClass ("active");
				break;

			case "overwrite-slot":
				var customName = $_("[data-notice='slot-overwrite'] input").value ().trim ();
				if (customName !== "") {
					saveToSlot (overwriteSlot, engine.SaveLabel + overwriteSlot, customName);
					overwriteSlot = null;
					$_("[data-notice='slot-overwrite']").removeClass ("active");
				}
				break;
		}
		return false;
	});

	$_("#game [data-action='back'], #game [data-action='back'] *").click(function (event) {
		event.stopPropagation ();
		if (canProceed ()) {
			previous ();
		}
	});

	$_("[data-action='back']:not(#game)").click(function (event) {
		event.stopPropagation();
		$_("section").hide();
		if (playing) {
			$_("#game").show ();
		} else {
			$_("[data-menu='main']").show ();
		}
	});

	/**
	 * ==========================
	 * In-Game Event Handlers
	 * ==========================
	 **/

	$_(document).keyup(function (e) {
		if (e.target.tagName.toLowerCase() != "input") {
			switch (e.which) {

				// Escape Key
				case 27:
					if ($_("#game").isVisible()) {
						$_("#game").hide();
						$_("[data-menu='settings']").show();
					}
					break;

				// Spacebar and Right Arrow
				case 32:
				case 39:
					if (canProceed()) {
						if (!finishedTyping && typeof textObject !== "undefined") {
							const str = textObject.strings [0];
							const element = $_(textObject.el).data ("ui");
							textObject.destroy ();
							if (element == "centered") {
								$_("[data-ui='centered']").html (str);
							} else {
								$_("[data-ui='say']").html (str);
							}
							finishedTyping = true;
						} else {
							hideCentered();
							shutUp();
							next ();
						}
					}
					break;

				// Left Arrow
				case 37:
					previous();
					break;

				// H Key
				case 72:
					event.stopPropagation();
					if ($_("[data-action='distraction-free']").hasClass("fa-eye")) {
						$_("[data-action='distraction-free']").removeClass("fa-eye");
						$_("[data-action='distraction-free']").addClass("fa-eye-slash");
						$_("[data-ui='text']").hide();
					} else if ($_("[data-action='distraction-free']").hasClass("fa-eye-slash")) {
						$_("[data-action='distraction-free']").removeClass("fa-eye-slash");
						$_("[data-action='distraction-free']").addClass("fa-eye");
						$_("[data-ui='text']").show();
					}
					break;

				// Exit this handler for other keys to run normally
				default:
					return;
			}
		}

		e.preventDefault();
	});

	$_("body").on("click", "[data-do]", function () {
		hideCentered();
		shutUp();
		if ($_(this).data("do") != "null" && $_(this).data("do") != "") {
			try {
				$_("[data-ui='choices']").hide();
				$_("[data-ui='choices']").html("");
				analyseStatement($_(this).data("do"), false);
			} catch (e) {
				console.error("An error ocurred while trying to execute the choice's action.\n" + e);
			}
		}
	});

	$_("#game [data-ui='quick-menu'], #game [data-ui='quick-menu'] *").click(function (event) {
		// Clicked Child
		event.stopPropagation();
	});

	$_("#game").click(function () {
		if (canProceed()) {
			if (!finishedTyping && typeof textObject !== "undefined") {
				const str = textObject.strings [0];
				const element = $_(textObject.el).data ("ui");
				textObject.destroy ();
				if (element == "centered") {
					$_("[data-ui='centered']").html (str);
				} else {
					$_("[data-ui='say']").html (str);
				}
				finishedTyping = true;
			} else {
				hideCentered ();
				shutUp();
				next ();
			}
		}
	});

	/**
	 * =======================
	 * Engine Helper Functions
	 * =======================
	 **/

	function displayDialog (dialog, animation) {

		// Destroy the previous textObject so the text is rewritten.
		// If not destroyed, the text would be appended instead of replaced.
		if (typeof textObject != "undefined") {
			textObject.destroy ();
		}

		// Remove contents from the dialog area.
		$_("[data-ui='say']").html ("");

		// Check if the typing animation flag is set to true in order to show it
		if (animation === true) {

			// Check if the TypeAnimation property exists in the engine configuration
			if (typeof engine.TypeAnimation !== "undefined") {

				// If the property is set to true, the animation will be shown
				// if it is set to false, even if the flag was set to true,
				// no animation will be shown in the game.
				if (engine.TypeAnimation === true) {
					typedConfiguration.strings = [dialog];
					textObject = new Typed ("[data-ui='say']", typedConfiguration);
				} else {
					$_("[data-ui='say']").html (dialog);
					if (autoPlay !== null) {
						autoPlay = setTimeout (function () {
							if (canProceed() && finishedTyping) {
								hideCentered();
								shutUp();
								next ();
							}
						}, settings.AutoPlaySpeed * 1000);
					}
					finishedTyping = true;
				}
			} else {
				typedConfiguration.strings = [dialog];
				textObject = new Typed ("[data-ui='say']", typedConfiguration);
			}
		} else {
			$_("[data-ui='say']").html (dialog);
			if (autoPlay !== null) {
				autoPlay = setTimeout (function () {
					if (canProceed() && finishedTyping) {
						hideCentered();
						shutUp();
						next ();
					}
				}, settings.AutoPlaySpeed * 1000);
			}
			finishedTyping = true;
		}
	}

	// Assert the result of a function
	function assertAsync (callable, args = null) {
		block = true;
		return new Promise (function (resolve, reject) {
			const result = callable.apply(null, args);
			// Check if the function returned a simple boolean
			// if the return value is true, the game will continue
			if (typeof result === "boolean") {
				if (result) {
					resolve ();
				} else {
					reject ();
				}
			} else if (typeof result === "object") {
				// Check if the result was a promise
				if (typeof result.then != "undefined") {

					result.then(function (value) {
						if (typeof value === "boolean") {
							if (value) {
								resolve ();
							} else {
								reject ();
							}
						}
					});
				} else {
					resolve ();
				}
			} else {
				reject ();
			}
		});
	}

	function canProceed () {
		if (!$_("[data-ui='choices']").isVisible()
			&& $_("#game").isVisible()
			&& !$_("[data-component='modal']").isVisible()
			&& (
				$_("[data-ui='text']").isVisible()
				|| (
					!$_("[data-ui='text']").isVisible()
					&& $_("[data-ui='centered']").isVisible()
					)
				)
			&& !$_("[data-component='video']").isVisible()
			&& !block
			) {
			return true;
		} else {
			return false;
		}
	}

	function resetGame () {
		stopVideo();
		silence();
		hideGameElements();

		clearInterval (autoPlay);
		autoPlay = null;

		$_("[data-action='auto-play'].fa").removeClass("fa-stop-circle");
		$_("[data-action='auto-play'].fa").addClass("fa-play-circle");

		// Reset Storage
		storage = JSON.parse(storageStructure);

		// Reset Conditions
		engine.Label = "Start";
		label = game[engine.Label];
		engine.Step = 0;

		// Reset History
		engine.MusicHistory = [];
		engine.SoundHistory = [];
		engine.ImageHistory = [];
		engine.CharacterHistory = [];
		engine.SceneHistory = [];
		engine.SceneElementsHistory = [];
		engine.ParticlesHistory = [];

		// Reset other States
		engine.Sound = "";
		engine.Song = "";
		engine.Particles = "";
		engine.Scene = "";
	}

	function hideCentered () {
		$_("[data-ui='centered']").remove();
		$_("[data-ui='text']").show();
	}

	function hideGameElements () {
		// Hide in-game elements
		$_("[data-ui='choices']").hide();
		$_("[data-ui='choices']").html("");

		$_("[data-component='modal']").removeClass("active");
		$_("[data-ui='messages']").removeClass("active");
		$_("[data-component='video']").removeClass("active");

		$_("[data-ui='centered']").remove();
		$_("#game [data-character]").remove();
		$_("#game [data-image]").remove();

		$_("[data-ui='input'] [data-ui='warning']").text("");

		$_("[data-ui='background']").style("background", "initial");
		whipeText();
	}

	function playAmbient () {
		if (engine.MenuMusic != "") {
			ambientPlayer.setAttribute("loop", "");

			if (typeof music !== "undefined") {
				if (typeof music[engine.MenuMusic] !== "undefined") {
					ambientPlayer.setAttribute("src", "audio/music/" + music[engine.MenuMusic]);
				} else {
					ambientPlayer.setAttribute("src", "audio/music/" + engine.MenuMusic);
				}
			} else {
				ambientPlayer.setAttribute("src", "audio/music/" + engine.MenuMusic);
			}
			ambientPlayer.play();
		}
	}

	// Stop any playing music or sound
	function silence () {
		for (let i = 0; i < document.getElementsByTagName("audio").length; i++) {
			const v = document.getElementsByTagName("audio");
			if (!v[i].paused && typeof v[i].src != "undefined" && v[i].src != "") {
				v[i].pause();
				v[i].currentTime = 0;
			}
		}
	}

	function stopVideo () {
		videoPlayer.pause();
		videoPlayer.currentTime = 0;
		videoPlayer.setAttribute("src", "");
		$_("[data-component='video']").removeClass("active");
	}

	// Stop the main menu's music
	function stopAmbient () {
		if (!ambientPlayer.paused) {
			ambientPlayer.pause();
		}
	}

	// Stop the voice player
	function shutUp () {
		if (!voicePlayer.paused && typeof voicePlayer.src != "undefined" && voicePlayer.src != "") {
			voicePlayer.pause();
			voicePlayer.currentTime = 0;
		}
	}

	// Function to end the game.
	function endGame () {
		playing = false;

		resetGame ();

		// Show main menu
		$_("section").hide();
		playAmbient();
		$_("[data-menu='main']").show();
	}

	// Function to execute the next statement in the script.
	function next () {
		engine.Step += 1;
		analyseStatement(label[engine.Step]);
	}

	function stopParticles () {
		try {
			if (typeof pJSDom === "object") {
				if (pJSDom.length > 0) {
					for (let i = 0; i < pJSDom.length; i++) {
						if (typeof pJSDom[i].pJS !== "undefined") {
							cancelAnimationFrame(pJSDom[i].pJS.fn.drawAnimFrame);
							pJSDom.shift ();
						}
					}
				}
			}
		} catch (e) {
			console.error ("An error ocurred while trying to stop particle system.");
		}

		engine.Particles = "";
		$_("#particles-js").html("");
	}

	// Function to execute the previous statement in the script.
	function previous () {

		hideCentered();
		shutUp();
		if (engine.Step >= 1) {
			engine.Step -= 1;
			const back = ["show", "play", "display", "hide", "stop", "particles", "wait", "scene", "clear", "vibrate", "notify", "next"];
			let flag = true;
			try {
				while (engine.Step > 0 && flag) {
					if (typeof label[engine.Step] == "string") {
						if (back.indexOf(label[engine.Step].split(" ")[0]) > -1) {
							const parts = replaceVariables(label[engine.Step]).split(" ");
							switch (parts[0]) {
								case "show":
									if (typeof characters[parts[1]] != "undefined") {
										$_("[data-character='" + parts[1] + "']").remove();
										if (engine.CharacterHistory.length > 1) {
											engine.CharacterHistory.pop();
										}

										const last_character = engine.CharacterHistory.slice(-1)[0];
										if (typeof last_character != "undefined") {
											if (last_character.indexOf("data-character='" + parts[1] + "'") > -1) {
												$_("#game").append(last_character);
											}
										}
									} else {
										if (typeof parts[3] != "undefined" && parts[3] != "") {
											$_("[data-image='" + parts[1] + "']").addClass(parts[3]);
										} else {
											$_("[data-image='" + parts[1] + "']").remove();
										}
										engine.ImageHistory.pop();
									}
									break;

								case "play":
									if (parts[1] == "music") {
										musicPlayer.removeAttribute("loop");
										musicPlayer.setAttribute("src", "");
										engine.Song = "";
										musicPlayer.pause();
										musicPlayer.currentTime = 0;
									} else if (parts[1] == "sound") {
										soundPlayer.removeAttribute("loop");
										soundPlayer.setAttribute("src", "");
										engine.Sound = "";
										soundPlayer.pause();
										soundPlayer.currentTime = 0;
									}
									break;

								case "stop":
									if (parts[1] == "music") {
										const last_song = engine.MusicHistory.pop().split(" ");

										if (last_song[3] == "loop") {
											musicPlayer.setAttribute("loop", "");
										} else if (last_song[3] == "noloop") {
											musicPlayer.removeAttribute("loop");
										}
										if (typeof music !== "undefined") {
											if (typeof music[last_song[2]] != "undefined") {
												musicPlayer.setAttribute("src", "audio/music/" + music[last_song[2]]);
											} else {
												musicPlayer.setAttribute("src", "audio/music/" + last_song[2]);
											}
										} else {
											musicPlayer.setAttribute("src", "audio/music/" + last_song[2]);
										}
										musicPlayer.play();
										engine.Song = last_song.join(" ");
									} else if (parts[1] == "sound") {
										const last = engine.SoundHistory.pop().split(" ");

										if (last[3] == "loop") {
											soundPlayer.setAttribute("loop", "");
										} else if (last[3] == "noloop") {
											soundPlayer.removeAttribute("loop");
										}

										if (typeof sound !== "undefined") {
											if (typeof sound[last[2]] != "undefined") {
												soundPlayer.setAttribute("src", "audio/sound/" + sound[last[2]]);
											} else {
												soundPlayer.setAttribute("src", "audio/sound/" + last[2]);
											}
										} else {
											soundPlayer.setAttribute("src", "audio/sound/" + last[2]);
										}

										soundPlayer.play();
										engine.Sound = last.join(" ");
									} else if (parts[1] == "particles") {
										if (typeof engine.ParticlesHistory === "object") {
											if (engine.ParticlesHistory.length > 0) {
												var last_particles = engine.ParticlesHistory.pop ();
												if (typeof particles[last_particles] !== "undefined") {
													particlesJS (particles[last_particles]);
													engine.Particles = last_particles;
												}
											}
										}
									}
									break;

								case "scene":
									engine.SceneHistory.pop();
									engine.Scene = engine.SceneHistory.slice(-1)[0];

									if (typeof engine.Scene != "undefined") {
										$_("[data-character]").remove();
										$_("[data-image]").remove();
										$_("[data-ui='background']").removeClass ();

										if (typeof scenes[engine.Scene] !== "undefined") {
											$_("[data-ui='background']").style("background", "url(img/scenes/" + scenes[engine.Scene] + ") center / cover no-repeat");
										} else {
											$_("[data-ui='background']").style("background", engine.Scene);
										}

										if (typeof  engine.SceneElementsHistory !== "undefined") {
											if (engine.SceneElementsHistory.length > 0) {
												var scene_elements = engine.SceneElementsHistory.pop ();

												if (typeof scene_elements === "object") {
													for (const element of scene_elements) {
														$_("#game").append (element);
													}
												}
											}
										} else {
											engine.SceneElementsHistory = [];
										}
									}

									whipeText();
									break;

								case "display":
									if (parts[1] == "message") {
										$_("[data-ui='message-content']").html("");
										$_("[data-ui='messages']").removeClass("active");
									} else if (parts[1] == "image") {
										$_("[data-image='" + parts[2] + "']").remove();
									}
									break;
								case "hide":
									if (typeof characters[parts[1]] != "undefined" && engine.CharacterHistory.length > 0) {
										$_("#game").append(engine.CharacterHistory.pop());

									} else if (typeof images[parts[1]] != "undefined" && engine.ImageHistory > 0) {
										$_("#game").append(engine.ImageHistory.pop());

									} else {
										flag = false;
										engine.Step += 1;
									}
									break;

								case "particles":
									stopParticles ();
									break;
								default:
									flag = false;
									break;
							}
							if ((engine.Step - 1) >= 0) {
								engine.Step -= 1;
							}
						} else {
							flag = false;
						}
					} else if (typeof label[engine.Step] == "object") {
						if (typeof label[engine.Step].Function !== "undefined") {
							assertAsync(label[engine.Step].Function.Reverse).then(function () {
								block = false;
							}).catch(function () {
								block = false;
							});
						}
						if ((engine.Step - 1) >= 0) {
							engine.Step -= 1;
						}
					} else {
						flag = false;
						engine.Step += 1;
					}
				}
				analyseStatement (label[engine.Step]);
			} catch (e) {
				console.error("An error ocurred while trying to exectute the previous statement.\n" + e);
			}
		}
	}

	function whipeText () {
		if (typeof textObject != "undefined") {
			textObject.destroy ();
		}
		$_("[data-ui='who']").html("");
		$_("[data-ui='say']").html("");
	}

	/**
	 * =======================
	 * Statements Functioning
	 * =======================
	 **/

	function replaceVariables (statement) {
		const matches = statement.match(/{{\S+}}/g);
		if (matches !== null) {
			for (let i = 0; i < matches.length; i++) {
				const path = matches[i].replace("{{", "").replace("}}", "").split(".");
				let data = storage[path[0]];
				for (let j = 1; j < path.length; j++) {
					data = data[path[j]];
				}
				statement = statement.replace(matches[i], data);
			}
		}
		return statement;
	}

	function analyseStatement (statement, advance) {
		if (typeof advance !== "boolean") {
			advance = true;
		}
		try {

			switch (typeof statement) {
				case "string":
					statement = replaceVariables(statement);
					var parts = statement.split(" ");

					switch (parts[0]) {

						case "wait":
							block = true;
							setTimeout(function () {
								block = false;
								if (advance) {
									next ();
								}
							}, parseInt (parts[1]));
							break;

						case "play":

							if (parts[1] == "music") {

								if (parts[3] == "loop") {
									musicPlayer.setAttribute("loop", "");
								} else if (parts[3] == "noloop") {
									musicPlayer.removeAttribute("loop");
								}

								if (typeof music !== "undefined") {
									if (typeof music[parts[2]] != "undefined") {
										musicPlayer.setAttribute("src", "audio/music/" + music[parts[2]]);
									} else {
										musicPlayer.setAttribute("src", "audio/music/" + parts[2]);
									}
								} else {
									musicPlayer.setAttribute("src", "audio/music/" + parts[2]);
								}

								musicPlayer.play();
								engine.Song = parts.join(" ");
								engine.MusicHistory.push(engine.Song);
								if (advance) {
									next ();
								}
							} else if (parts[1] == "sound") {
								if (parts[3] == "loop") {
									soundPlayer.setAttribute("loop", "");
								} else if (parts[3] == "noloop") {
									soundPlayer.removeAttribute("loop");
								}

								if (typeof sound !== "undefined") {
									if (typeof sound[parts[2]] != "undefined") {
										soundPlayer.setAttribute("src", "audio/sound/" + sound[parts[2]]);
									} else {
										soundPlayer.setAttribute("src", "audio/sound/" + parts[2]);
									}
								} else {
									soundPlayer.setAttribute("src", "audio/sound/" + parts[2]);
								}

								soundPlayer.play();
								engine.Sound = parts.join(" ");
								engine.SoundHistory.push(engine.Sound);
								if (advance) {
									next ();
								}
							} else if (parts[1] == "voice") {

								if (typeof voice !== "undefined") {
									if (typeof voice[parts[2]] != "undefined") {
										voicePlayer.setAttribute("src", "audio/voice/" + voice[parts[2]]);
									} else {
										voicePlayer.setAttribute("src", "audio/voice/" + parts[2]);
									}
								} else {
									voicePlayer.setAttribute("src", "audio/voice/" + parts[2]);
								}

								voicePlayer.play();
								if (advance) {
									next ();
								}
							} else if (parts[1] == "video") {


								if (typeof videos !== "undefined") {
									if (typeof videos[parts[2]] != "undefined") {
										videoPlayer.setAttribute("src", "video/" + videos[parts[2]]);
									} else {
										videoPlayer.setAttribute("src", "video/" + parts[2]);
									}
								} else {
									videoPlayer.setAttribute("src", "video/" + parts[2]);
								}

								$_("[data-component='video']").addClass("active");
								videoPlayer.play();
							}

							break;

						case "scene":

							var scene_elements = [];
							$_("#game img:not([data-ui='face']):not([data-visibility='invisible'])").each(function (element) {
								scene_elements.push (element.outerHTML);
							});
							if (typeof engine.SceneElementsHistory !== "object") {
								engine.SceneElementsHistory = [];
							}
							engine.SceneElementsHistory.push (scene_elements);

							$_("[data-character]").remove();
							$_("[data-image]").remove();
							$_("[data-ui='background']").removeClass();

							// scene [scene]
							//   0      1
							if (typeof scenes[parts[1]] != "undefined") {
								$_("[data-ui='background']").style("background", "url(img/scenes/" + scenes[parts[1]] + ") center / cover no-repeat");
							} else {
								$_("[data-ui='background']").style("background", parts[1]);
							}

							// Check if an animation or class was provided
							// scene [scene] with [animation] [infinite]
							//   0      1     2       3           4
							if (parts.length > 2) {
								if (parts[2] == "with" && parts[3].trim != "") {
									$_("[data-ui='background']").addClass ("animated");
									var class_list = (parts.join(" ").replace ("scene " + parts[1], "").replace (" with ", " ")).trim ().split (" ");
									for (const newClass of class_list) {
										$_("[data-ui='background']").addClass (newClass);
									}
								}
							}

							engine.Scene = parts[1];
							engine.SceneHistory.push(parts[1]);
							whipeText();
							if (advance) {
								next ();
							}
							break;

						case "show":
							// show [character] [expression] at [position] with [animation] [infinite]
							//   0      1             2       3     4        5       6         7

							// show [character] [expression] with [animation] [infinite]
							//   0      1             2       3       4         5

							// show [character] [expression]
							//   0      1             2
							var classes = "";
							if (typeof characters[parts[1]] != "undefined") {
								let directory = characters[parts[1]].Directory;
								if (typeof directory == "undefined") {
									directory = "";
								}
								const image = characters[parts[1]].Images[parts[2]];
								$_("[data-character='" + parts[1] + "']").remove();

								if (parts[3] == "at") {
									parts[3] == parts[4];
								}

								if (parts[3] == "with" || typeof parts[3] == "undefined") {
									parts[3] = "center";
								}

								classes = parts.join(" ").replace("show " + parts[1] +" "+ parts[2], "").replace(" at ", "").replace(" with ", " ");


								$_("#game").append("<img src='img/characters/" + directory + "/" + image + "' class='animated " + classes + "' data-character='" + parts[1] + "' data-sprite='" + parts[2] + "'>");
								engine.CharacterHistory.push("<img src='img/characters/" + directory + "/" + image + "' class='animated " + classes + "' data-character='" + parts[1] + "' data-sprite='" + parts[2] + "'>");

							} else {
								// show [image] at [position] with [animation]
								//   0     1     2      3      4        5

								// show [image] with [animation]
								//   0      1     2       3

								// show [image]
								//   0      1

								if (parts[2] == "at") {
									parts[2] == parts[3];
								}

								if (parts[2] == "with" || typeof parts[2] == "undefined") {
									parts[2] = "center";
								}

								let src = "";
								if (typeof images[parts[1]] != "undefined") {
									src = images[parts[1]];
								} else {
									src = parts[1];
								}

								classes = parts.join(" ").replace("show " + parts[1], "").replace(" at ", "").replace(" with ", " ");

								const imageObject = "<img src='img/" + src + "' class='animated " + classes + "' data-image='" + parts[1] + "' data-sprite='" + parts[1] + "'>";
								$_("#game").append(imageObject);
								engine.ImageHistory.push(imageObject);

							}
							if (advance) {
								next ();
							}
							break;

						case "jump":
							engine.Step = 0;
							label = game[parts[1]];
							engine.Label = parts[1];
							whipeText();
							analyseStatement(label[engine.Step]);
							break;

						case "stop":
							if (parts[1] == "music") {
								musicPlayer.removeAttribute("loop");
								musicPlayer.setAttribute("src", "");
								engine.Song = "";
								musicPlayer.pause();
								musicPlayer.currentTime = 0;
							} else if (parts[1] == "sound") {
								soundPlayer.removeAttribute("loop");
								soundPlayer.setAttribute("src", "");
								engine.Sound = "";
								soundPlayer.pause();
								soundPlayer.currentTime = 0;
							} else if (parts[1] == "particles") {
								stopParticles ();
							}
							if (advance) {
								next ();
							}
							break;

						case "pause":
							if (parts[1] == "music") {
								musicPlayer.pause();
							} else if (parts[1] == "sound") {
								soundPlayer.pause();
							}
							if (advance) {
								next ();
							}
							break;

						case "hide":
							if (typeof characters[parts[1]] != "undefined") {
								if (typeof parts[3] != "undefined" && parts[3] != "") {
									$_("[data-character='" + parts[1] + "']").addClass(parts[3]);
									$_("[data-character='" + parts[1] + "']").data ("visibility", "invisible");
								} else {
									$_("[data-character='" + parts[1] + "']").remove();
								}

							} else if (typeof images[parts[1]] != "undefined") {
								if (typeof parts[3] != "undefined" && parts[3] != "") {
									$_("[data-image='" + parts[1] + "']").addClass(parts[3]);
									$_("[data-image='" + parts[1] + "']").data ("visibility", "invisible");
								} else {
									$_("[data-image='" + parts[1] + "']").remove();
								}

							} else {
								if (typeof parts[3] != "undefined" && parts[3] != "") {
									$_("[data-image='" + parts[1] + "']").addClass(parts[3]);
									$_("[data-image='" + parts[1] + "']").data ("visibility", "invisible");
								} else {
									$_("[data-image='" + parts[1] + "']").remove();
								}
							}
							if (advance) {
								next ();
							}
							break;

						case "display":

							if (parts[1] == "message") {
								if (typeof messages == "object") {
									const mess = messages[parts[2]];
									$_("[data-ui='message-content']").html("<h3>" + mess.Title + "</h3><p>" + mess.Subtitle + "</p>" + "<p>" + mess.Message + "</p>");
									$_("[data-ui='messages']").addClass("active");
								}
							} else if (parts[1] == "image") {
								if (typeof parts[3] === "undefined") {
									parts[3] = "center";
								}
								if (parts[3] == "with") {
									parts[3] = "center";
									parts[5] = parts[4];
								}
								if (typeof images[parts[2]] !== "undefined") {
									$_("#game").append("<img src='img/" + images[parts[2]] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
									engine.ImageHistory.push("<img src='img/" + images[parts[2]] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
								} else {
									$_("#game").append("<img src='img/" + parts[2] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
									engine.ImageHistory.push("<img src='img/" + parts[2] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
								}

							}
							break;

						case "end":
							endGame();
							break;

						case "next":
							next();
							break;

						case "$":
							console.error("Executing inline javascript has been deprecated for security.");
							next();
							break;

						case "clear":
							whipeText();
							if (advance) {
								next ();
							}
							break;

						case "centered":
							$_("[data-ui='text']").hide();
							$_("#game").append("<div class='middle align-center' data-ui='centered'></div>");
							if (engine.TypeAnimation) {
								if (engine.CenteredTypeAnimation) {
									typedConfiguration.strings = [statement.replace(parts[0] + " ", "")];
									textObject = new Typed ("[data-ui='centered']", typedConfiguration);
								} else {
									$_("[data-ui='centered']").html (statement.replace(parts[0] + " ", ""));
								}
							} else {
								$_("[data-ui='centered']").html (statement.replace(parts[0] + " ", ""));
							}
							break;

						case "vibrate":
							if (navigator) {
								if (navigator.vibrate) {
									navigator.vibrate(0);
									if (parts.length > 2) {
										navigator.vibrate(parts.slice(1, parts.length));
									} else {
										navigator.vibrate(parts[1]);
									}
								}
							}
							if (advance) {
								next ();
							}
							break;

						case "notify":
							if (typeof notifications == "object") {
								if (notifications[parts[1]] && ("Notification" in window)) {
									// Let's check whether notification permissions have already been granted
									if (Notification.permission === "granted") {
										// If it's okay let's create a notification
										const notification = new Notification(notifications[parts[1]].title, notifications[parts[1]]);

										if (parts[2]) {
											setTimeout(function () {
												notification.close();
											}, parseInt(parts[2]));
										}

									} else if (Notification.permission !== "denied") {
										Notification.requestPermission(function (permission) {
											// If the user accepts, let's create a notification
											if (permission === "granted") {
												const notification = new Notification(notifications[parts[1]].title, notifications[parts[1]]);
												if (parts[2]) {
													setTimeout(function () {
														notification.close();
													}, parseInt(parts[2]));
												}
											}
										});
									}
								}
							} else {
								console.error("The notifications object is not defined.");
							}
							if (advance) {
								next ();
							}
							break;

						case "particles":
							if (typeof particles == "object") {
								if (particles[parts[1]]) {
									if (typeof particlesJS != "undefined") {
										particlesJS(particles[parts[1]]);
										if (typeof engine.ParticlesHistory !== "object") {
											engine.ParticlesHistory = [];
										}
										engine.ParticlesHistory.push (parts[1]);
										engine.Particles = parts[1];
										if (advance) {
											next ();
										}
									} else {
										console.error("particlesJS is not loaded, are you sure you added it?");
									}
								} else {
									console.error("There is no definition of the '" + parts[1] + "' particle configuration.");
								}
							} else {
								console.error("The particles object is not defined.");
							}
							break;

						default:
							// Default case, used to show the dialog.
							var character = parts[0].split(":");
							var directory;

							// Remove focus from previous character.
							$_("[data-character]").removeClass("focus");

							// The character length condition checks if the split from above (:) contains two elements.
							// If there are two elements, then it's probable that it is a character identifier and
							// a face expression to be shown.

							// The typeof check, is to see if the character actually exists, if it does not, then it is
							// treated as a normal work and the narrator is used to show the dialog
							if (character.length > 1 && typeof characters[character[0]] !== "undefined") {
								$_("[data-ui='who']").html(replaceVariables(characters[character[0]].Name));
								$_("[data-character='" + character[0] + "']").addClass("focus");
								$_("[data-ui='who']").style("color", characters[character[0]].Color);

								// Check if the character object defines if the type animation should be used.
								if (typeof characters[character[0]].TypeAnimation !== "undefined") {
									if (characters[character[0]].TypeAnimation === true) {
										displayDialog (statement.replace(parts[0] + " ", ""), true);
									} else {
										displayDialog (statement.replace(parts[0] + " ", ""), false);
									}
								} else {
									displayDialog (statement.replace(parts[0] + " ", ""), true);
								}

								if (typeof characters[character[0]].Side != "undefined") {
									if (typeof characters[character[0]].Side[character[1]] != "undefined" && characters[character[0]].Side[character[1]] != "") {
										directory = characters[character[0]].Directory;
										if (typeof directory == "undefined") {
											directory = "";
										}
										$_("[data-ui='face']").attribute("src", "img/characters/" + directory + "/" + characters[character[0]].Side[character[1]]);
										$_("[data-ui='face']").show();
									} else {
										$_("[data-ui='face']").hide();
									}
								} else {
									$_("[data-ui='face']").hide();
								}
							} else if (typeof characters[parts[0]] != "undefined") {
								$_("[data-ui='who']").html(replaceVariables(characters[parts[0]].Name));
								$_("[data-character='" + parts[0] + "']").addClass("focus");
								$_("[data-ui='who']").style("color", characters[parts[0]].Color);

								// Check if the character object defines if the type animation should be used.
								if (typeof characters[character[0]].TypeAnimation !== "undefined") {
									if (characters[character[0]].TypeAnimation === true) {
										displayDialog (statement.replace(parts[0] + " ", ""), true);
									} else {
										displayDialog (statement.replace(parts[0] + " ", ""), false);
									}
								} else {
									displayDialog (statement.replace(parts[0] + " ", ""), true);
								}

								if (typeof characters[parts[0]].Face != "undefined" && characters[parts[0]].Face != "") {
									directory = characters[parts[0]].Directory;
									if (typeof directory == "undefined") {
										directory = "";
									}
									$_("[data-ui='face']").attribute("src", "img/characters/" + directory + "/" + characters[parts[0]].Face);
									$_("[data-ui='face']").show();
								} else {
									$_("[data-ui='face']").hide();
								}
							} else {
								// The narrator is speaking
								$_("[data-ui='face']").hide();
								document.querySelector("[data-ui='who']").innerHTML = "";

								if (typeof engine.NarratorTypeAnimation !== "undefined") {
									if (engine.NarratorTypeAnimation === true) {
										displayDialog (statement, true);
									} else {
										displayDialog (statement, false);
									}
								} else {
									displayDialog (statement, true);
								}
							}
							break;
					}
					break;

				case "function":
					assertAsync(statement).then(function () {
						block = false;
						if (advance) {
							next ();
						}
					}).catch(function () {
						block = false;
					});
					break;

				case "object":
					if (typeof statement.Choice != "undefined") {
						$_("[data-ui='choices']").html("");
						for (const i in statement.Choice) {
							const choice = statement.Choice[i];
							if (typeof choice.Condition != "undefined" && choice.Condition != "") {

								assertAsync(statement.Choice[i].Condition).then(function () {
									if (typeof choice.Class != "undefined") {
										$_("[data-ui='choices']").append("<button data-do='" + choice.Do + "' class='" + choice.Class + "'>" + choice.Text + "</button>");
									} else {
										$_("[data-ui='choices']").append("<button data-do='" + choice.Do + "'>" + choice.Text + "</button>");
									}
									block = false;
								}).catch(function () {
									block = false;
								});
							} else {
								if (typeof choice == "object") {
									if (typeof choice.Class != "undefined") {
										$_("[data-ui='choices']").append("<button data-do='" + choice.Do + "' class='" + choice.Class + "'>" + choice.Text + "</button>");
									} else {
										$_("[data-ui='choices']").append("<button data-do='" + choice.Do + "'>" + choice.Text + "</button>");
									}
								} else if (typeof choice == "string") {
									analyseStatement(choice, false);
								}
							}
							$_("[data-ui='choices']").show();
						}
					} else if (typeof statement.Conditional != "undefined") {
						const condition = statement.Conditional;
						assertAsync(condition.Condition).then(function () {
							analyseStatement(condition.True, false);
							block = false;
						}).catch(function () {
							analyseStatement(condition.False, false);
							block = false;
						});

					} else if (typeof statement.Input != "undefined") {
						$_("[data-ui='input'] [data-ui='input-message']").text(statement.Input.Text);
						$_("[data-ui='input']").addClass("active");

						function inputButtonListener (event) {
							event.stopPropagation ();
							event.preventDefault ();
							const inputValue = $_("[data-ui='input'] input").value();

							assertAsync(statement.Input.Validation, [inputValue]).then(function () {
								assertAsync(statement.Input.Save, [inputValue]).then(function () {
									$_("[data-ui='input']").removeClass("active");
									$_("[data-ui='input'] [data-ui='warning']").text("");
									$_("[data-ui='input'] input").value("");
									$_("[data-ui='input'] [data-action='submit']").get(0).removeEventListener("click", inputButtonListener);
									next ();
									block = false;
								}).catch(function () {
									$_("[data-ui='input']").removeClass("active");
									$_("[data-ui='input'] [data-ui='warning']").text("");
									$_("[data-ui='input'] input").value("");
									$_("[data-ui='input'] [data-action='submit']").get(0).removeEventListener("click", inputButtonListener);
									block = false;
								});
							}).catch(function () {
								$_("[data-ui='input'] [data-ui='warning']").text(statement.Input.Warning);
								block = false;
							});
						}

						$_("[data-ui='input'] [data-action='submit']").click(inputButtonListener);
					} else if (typeof statement.Function !== "undefined") {
						assertAsync(statement.Function.Apply).then(function () {
							block = false;
							if (advance) {
								next ();
							}
						}).catch(function () {
							block = false;
						});
					}
					break;
			}
		} catch (e) {
			console.error("An error ocurred while while trying to analyse the following statement: " + statement + "\n" + e);
			next();
		}
	}
});