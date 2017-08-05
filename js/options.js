/**
 * =======================================
 * Engine Settings
 *
 * Do not modify the ones marked with a *
 * Unless you know what you are doing
 * =======================================
 **/

"use strict";
/* exported engine */
/* exported storage */
/* exported settings */

var engine = {

	// Initial Label *
	"Label": "Start",

	// Number of Save Slots
	"Slots": 10,

	// Current Media *
	"Song": "",
	"Sound": "",
	"Scene": "",

	// Current Statement *.
	"Step": 0,

	// History for the previous function *.
	"MusicHistory": [],
	"SoundHistory": [],
	"ImageHistory": [],
	"CharacterHistory": [],
	"SceneHistory": [],

	// Change to true for a MultiLanguage Game.
	"MultiLanguage": false,

	// Music for the Main Menu.
	"MenuMusic": "",

	// Prefix for the Save Slots in Local Storage.
	"SaveLabel": "Save_",
	"AutoSaveLabel": "AutoSave_",

	// Turn main menu on/off; Default: true *
	"ShowMenu": true,

	// Turn image preloading on/off, Default: true
	"Preload": true,

	// Time interval between autosaves (In Minutes). Default: 0 (Off)
	"AutoSave": 0,

	// Enable service workers; Default: true *
	"ServiceWorkers": true,

	// The Aspect Ratio your background images are on. This has no effect on
	// web deployed novels.
	"AspectRatio": "16:9"
};

// Initial Settings
var settings = {

	// Initial Language for Multilanguage Games or for the Default GUI Language.
	"Language": "English",

	// Initial Volumes from 0.0 to 1.
	"Volume": {
		"Music": 1,
		"Voice": 1,
		"Sound": 1
	},

	// Initial resolution used for Electron, it must match the settings inside
	// the electron.js file. This has no effect on web deployed novels.
	"Resolution": "800x600",

	// Speed at which dialog text will appear
	"TextSpeed": 20,

	// Speed at which dialog text will appear
	"AutoPlaySpeed": 5
};

// Persistent Storage Variable
var storage = {
	player: {
		name: ""
	}
};