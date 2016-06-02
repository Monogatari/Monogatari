// Engine Settings.

// Do not modify the ones marked with a *

// Unless you know what you are doing

var engine = {

	// Initial Label *
	"Label": "Start",

	// Number of Save Slots
	"Slots": 10,

	// Current Media *.
	"Song": "",
	"Sound": "",
	"Scene": "",

	// Javascript saved from the $ command *.
	"JS": "",

	// Current Statement *.
	"Step": 0,

	// History for the previous function *.
	"MusicHistory":[],
	"SoundHistory":[],
	"ImageHistory":[],
	"CharacterHistory":[],
	"SceneHistory":[],

	// Change to true for a MultiLanguage Game.
	"MultiLanguage": false,

	// Music for the Main Menu.
	"MenuMusic": "",

	// Prefix for the Save Slots in Local Storage.
	"SaveLabel": "Save_"
}

// Initial Settings
var settings = {

	// Initial Language for Multilanguage Games.
	"Language": "English",

	// Initial Volumes from 0.0 to 1.
	"Volume":{
		"Music": 1,
		"Voice": 1,
		"Sound": 1
	}
}
