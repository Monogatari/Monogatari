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

let engine = {

	// Initial Label *
	"Label": "Start",

	// Number of AutoSave Slots
	"Slots": 10,

	// Current Media *
	"Song": "",
	"Sound": "",
	"Scene": "",
	"Particles": "",

	// Current Statement *.
	"Step": 0,

	// History for the previous function *.
	"MusicHistory": [],
	"SoundHistory": [],
	"ImageHistory": [],
	"CharacterHistory": [],
	"SceneHistory": [],
	"SceneElementsHistory": [],
	"ParticlesHistory": [],

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
	"AspectRatio": "16:9",

	// Enables or disables the typing text animation for the whole game.
	"TypeAnimation": true,

	// Enables or disables the typing animation for the narrator.
	// If the previous property was set to false, the narrator won't shown
	// the animation even if this is set to true.
	"NarratorTypeAnimation": true,

	// Enables or disables the typing animation for the special centered
	// character. If the TypeAnimation property was set to false, the centered
	// character won't shown the animation even if this is set to true.
	"CenteredTypeAnimation": true
};

// Initial Settings
let settings = {

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

	// Speed at which the Auto Play feature will show the next statement
	// It is measured in seconds and starts counting after the text is
	// completely displayed.
	"AutoPlaySpeed": 5
};