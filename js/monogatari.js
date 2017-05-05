/**
 * ====================================
 * I N D E X
 * ====================================
 * 1)  Initialize Variables
 * 2)  Plugin Function Calls
 * 3)  Set Initial Settings
 * 4)  Set iOS Conditions
 * 5)  Set Save and Load Slots
 * 6)  Save and Load Functions
 * 7)  Save and Load Events
 * 8)  Settings Event Handlers
 * 9)  Storage
 * 10) Quick Start
 * 11) Data-Action Event Handlers
 * 12) In-Game Event Handlers
 * 13) Engine Helper Functions
 * 14) Statements Functioning
 * ====================================
 **/

/**
 * ======================
 * Initialize Variables
 * ======================
 **/

var label, game;
var playing = false;

$_ready(function() {

	/**
	 * ======================
	 * Plugin Function Calls
	 * ======================
	 **/

	/**
	 * ======================
	 * Set Initial Settings
	 * ======================
	 **/

	var local_settings = Storage.get("Settings");

	// Set the initial settings if they don't exist or load them.
	if (local_settings == null || local_settings == "") {
		Storage.set("Settings", JSON.stringify(settings));
	} else {
		settings = JSON.parse(local_settings);
	}

	// Disable the load and save slots in case Local Storage is not supported.
	if (!window.localStorage) {
		$_("[data-ui='slots']").html("<p>Local Storage is not Available in this Browser</p>");
	}

	// Set the game language or hide the option if the game is not multilingual
	if (engine["MultiLanguage"]) {
		game = script[settings["Language"]];
		$_("[data-action='set-language']").value(settings["Language"]);
		$_("[data-string]").each(function(element) {
			var string_translation = strings[$_("[data-action='set-language']").value()][$_(element).data("string")];
			if (string_translation != null && string_translation != "") {
				$_(element).text(string_translation);
			}
		});
	} else {
		game = script;
		$_("[data-settings='language']").hide();
	}

	// Set the label in which the game will start
	label = game[engine["Label"]];

	// Set the volume of all the media components
	document.querySelector("[data-component='music']").volume = settings["Volume"]["Music"];
	document.querySelector("[data-component='ambient']").volume = settings["Volume"]["Music"];
	document.querySelector("[data-component='voice']").volume = settings["Volume"]["Voice"];
	document.querySelector("[data-component='sound']").volume = settings["Volume"]["Sound"];
	document.querySelector("[data-target='music']").value = settings["Volume"]["Music"];
	document.querySelector("[data-target='voice']").value = settings["Volume"]["Voice"];
	document.querySelector("[data-target='sound']").value = settings["Volume"]["Sound"];

	// Set all the dynamic backgrounds of the data-background property
	$_('[data-background]').each(function(element) {
		if ($_(element).data("background").indexOf(".") > -1) {
			var src = "url('" + $_(element).data("background") + "') center / cover no-repeat";
			$_(element).style("background", src);
		} else {
			$_(element).style("background", $_(element).data("background"));
		}
	});

	// Play the main menu song
	playAmbient();

	// Set Electron's quit handler.
	try {
		window.onbeforeunload = function() {
			if (confirm(strings[settings["Language"]]["Confirm"])) {
				window.close();
			}
		}
	} catch (e) {

	}

	// Set the initial language translations
	$_("[data-string]").each(function(element) {
		$_(element).text(strings[settings["Language"]][$_(element).data("string")]);
	});

	/**
	 * ======================
	 * Set iOS Conditions
	 * ======================
	 **/

	// Disable audio settings in iOS since they are not supported
	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		$_("[data-settings='audio']").html("<p>Audio settings are not supported on iOS</p>");
	}

	/**
	 * =======================
	 * Set Save and Load Slots
	 * =======================
	 **/

	// Create all save and load slots
	function setSlots() {
		if (!window.localStorage) {
			return false;
		}

		$_("[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots']").html("");
		$_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").html("");
		$_("[data-menu='save'] [data-ui='slots']").html("");

		// Add missing statements in engine configuration
		// in case they are not there
		if (typeof engine.AutoSave == 'undefined') {
			engine.AutoSave = 0;
			console.warn("The AutoSave property is missing in the engine configuration.");
		}

		if (typeof engine.AutoSaveLabel == 'undefined') {
			engine.AutoSaveLabel = "AutoSave_";
			console.warn("The AutoSaveLabel property is missing in the engine configuration.");
		}

		for (var i = 1; i <= engine["Slots"]; i++) {

			var slot = Storage.get(engine["SaveLabel"] + i);
			var autoSaveSlot = Storage.get(engine["AutoSaveLabel"] + i);

			if (slot == null) {
				Storage.set(engine["SaveLabel"] + i, "");
				$_("[data-menu='save'] [data-ui='slots']").append("<figure data-save='" + i + "'><figcaption>Save in slot " + i + "</figcaption></figure>");
			} else if (slot != "") {
				var data = JSON.parse(slot);

				if (scenes[data["Engine"]["Scene"]] != null) {

					$_("[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots']").append("<figure data-load-part='" + data["Label"] + "' data-load-element='" + data["Engine"]["Step"] + "' data-load-slot='" + i + "' class='animated flipInX'><img src='img/scenes/" + scenes[data["Engine"]["Scene"]] + "' alt=''><figcaption>" + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");

					$_("[data-menu='save'] [data-ui='slots']").append("<figure data-save='" + i + "'><img src='img/scenes/" + scenes[data["Engine"]["Scene"]] + "' alt=''><figcaption>Overwrite " + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");

				} else {
					$_("[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots']").append("<figure data-load-part='" + data["Label"] + "' data-load-element='" + data["Engine"]["Step"] + "' data-load-slot='" + i + "' class='animated flipInX'><figcaption>" + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");

					$_("[data-menu='save'] [data-ui='slots']").append("<figure data-save='" + i + "'><figcaption>Overwrite " + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");
				}

			} else {
				$_("[data-menu='save'] [data-ui='slots']").append("<figure data-save='" + i + "'><figcaption>Save in slot " + i + "</figcaption></figure>");
			}

			if (autoSaveSlot == null) {
				Storage.set(engine["AutoSaveLabel"] + i, "");
			} else if (autoSaveSlot != "") {
				var data = JSON.parse(autoSaveSlot);

				if (scenes[data["Engine"]["Scene"]] != null) {
					$_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").append("<figure data-load-part='" + data["Label"] + "' data-load-element='" + data["Engine"]["Step"] + "' data-load-slot='" + i + "' class='animated flipInX'><img src='img/scenes/" + scenes[data["Engine"]["Scene"]] + "' alt=''><figcaption>" + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");
				} else {
					$_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").append("<figure data-load-part='" + data["Label"] + "' data-load-element='" + data["Engine"]["Step"] + "' data-load-slot='" + i + "' class='animated flipInX'><figcaption>" + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");
				}

			}
		}

		// Check if there are no Saved games.
		if ($_("[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots']").html().trim() == "") {
			$_("[data-menu='load'] [data-ui='slots']").html("<p>No saved games.</p>");
		}

		// Check if there are no Auto Saved games.
		if ($_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").html().trim() == "") {
			$_("[data-menu='load'] [data-ui='autoSaveSlots'] [data-ui='slots']").html("<p>No automatically saved games.</p>");
		}
	}

	setSlots();

	/**
	 * =======================
	 * Save and Load Functions
	 * =======================
	 **/

	function saveToSlot(slot) {
		if (playing) {
			document.body.style.cursor = "wait";
			var date = new Date();
			var day = date.getDate();
			var month = date.getMonth() + 1;
			var year = date.getFullYear();
			var show = "";

			$_("#game img:not([data-ui='face'])").each(function(element) {
				show += element.outerHTML.replace(/"/g, "'") + ",";
			});

			Storage.set(slot, '{"Date":"' + day + "-" + month + "-" + year + '","Engine":' + JSON.stringify(engine) + ',"Show":"' + show + '","Label":"' + engine["Label"] + '", "Storage":' + JSON.stringify(storage) + '}');
			$_("[data-menu='load'] [data-ui='saveSlots'] [data-ui='slots']").html("");
			$_("[data-menu='save'] [data-ui='slots']").html("");
			setSlots();
			document.body.style.cursor = "auto";
		}
	}

	function loadFromSlot(slot) {
		document.body.style.cursor = "wait";
		playing = true;
		$_("section").hide();
		$_("#game").show();
		$_("[data-character]").remove();
		var data = JSON.parse(Storage.get(slot));
		engine = data["Engine"];
		storage = data["Storage"];

		label = game[data["Label"]];

		for (var j in engine["JS"].split("::")) {
			eval(engine["JS"].split("::")[j]);

		}

		for (var i in data["Show"].split(",")) {
			if (data["Show"].split(",")[i].trim() != "") {
				$_("#game").append(data["Show"].split(",")[i]);
			}
		}

		$_('#game').fadeOut(200, function() {

			if (scenes[data["Engine"]["Scene"]] != null) {
				$_('#game').style("background", "url(img/scenes/" + scenes[data["Engine"]["Scene"]] + ") center / cover no-repeat");
			} else {
				$_('#game').style("background", data["Engine"]["Scene"]);
			}

			$_('#game').fadeIn(200);
		});

		if (engine["Song"] != "") {
			analyseStatement(engine["Song"]);
			engine["Step"] -= 1;
		}

		if (engine["Sound"] != "") {
			analyseStatement(engine["Sound"]);
			engine["Step"] -= 1;
		}

		if (engine["Step"] > 0) {
			engine["Step"] -= 1;
		}

		$_("#game").show();
		analyseStatement(label[engine["Step"]]);
		engine["Step"] += 1;
		document.body.style.cursor = "auto";
	}

	/**
	 * =======================
	 * Save and Load Events
	 * =======================
	 **/

	// Load a saved game slot when it is pressed
	$_("[data-menu='load'] [data-ui='saveSlots']").on("click", "figcaption, img", function() {
		loadFromSlot(engine["SaveLabel"] + $_(this).parent().data("loadSlot"));
	});

	// Load an autosaved game slot when it is pressed
	$_("[data-menu='load'] [data-ui='autoSaveSlots']").on("click", "figcaption, img", function() {
		loadFromSlot(engine["AutoSaveLabel"] + $_(this).parent().data("loadSlot"));
	});

	// Save to slot when a slot is pressed.
	$_("[data-menu='save']").on("click", "figcaption, img", function() {
		saveToSlot(engine["SaveLabel"] + $_(this).parent().data("save"));
	});

	// Auto Save
	var currentAutoSaveSlot = 1;
	if (engine["AutoSave"] != 0 && typeof engine["AutoSave"] == "number") {
		setInterval(function() {
			saveToSlot(engine["AutoSaveLabel"] + currentAutoSaveSlot);

			if (currentAutoSaveSlot == engine["Slots"]) {
				currentAutoSaveSlot = 1;
			} else {
				currentAutoSaveSlot += 1;
			}
			setSlots();

		}, engine["AutoSave"] * 60000);
	} else {
		$("[data-menu='load'] [data-ui='autoSaveSlots']").hide();

	}

	/**
	 * =======================
	 * Settings Event Handlers
	 * =======================
	 **/

	// Volume bars listeners
	$_("[data-action='set-volume']").on("change mouseover", function() {
		var v = document.querySelector("[data-component='" + $_(this).data("target") + "']");
		var value = $_(this).value();

		switch ($_(this).data("target")) {
			case "music":
				var ambient = document.querySelector("[data-component='ambient']");
				ambient.volume = value;
				v.volume = value;
				settings["Volume"]["Music"] = value;
				break;

			case "voice":
				v.volume = value;
				settings["Volume"]["Voice"] = value;
				break;

			case "sound":
				v.volume = value;
				settings["Volume"]["Sound"] = value;
				break
		}
		Storage.set("Settings", JSON.stringify(settings));
	});

	// Language select listener
	$_("[data-action='set-language']").change(function() {
		settings["Language"] = $_("[data-action='set-language']").value();
		game = script[settings["Language"]];
		label = game[engine["Label"]];
		Storage.set("Settings", JSON.stringify(settings));

		$_("[data-string]").each(function(element) {
			$_(element).text(strings[$_("[data-action='set-language']").value()][$_(element).data("string")]);
		});
	});

	// Fix for select labels
	$_("[data-select]").click(function() {
		var e = document.createEvent('MouseEvents');
		e.initMouseEvent('mousedown');
		$_("[data-action='" + $_(this).data("select") + "']")[0].dispatchEvent(e);
	});

	/**
	 * =======================
	 * Storage
	 * =======================
	 **/

	// Retrieve data from the storage variable
	function getData(data) {
		if (typeof storage != 'undefined') {
			var path = data.split(".");

			data = storage[path[0]];
			for (var i = 1; i < path.length; i++) {
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
	if (typeof engine.ShowMenu != 'undefined') {
		if (!engine["ShowMenu"]) {
			stopAmbient();
			playing = true;
			$_("section").hide();
			$_("#game").show();
			analyseStatement(label[engine["Step"]]);
			engine["Step"] += 1;
		}
	}

	/**
	 * ==========================
	 * Data-Action Event Handlers
	 * ==========================
	 **/

	$_("[data-action]").click(function(event) {

		switch ($_(this).data("action")) {

			case "open-menu":
				$_("section").hide();
				$_("[data-menu='" + $_(this).data("open") + "']").show();
				break;

			case "pause":
				break;

			case "start":
				stopAmbient();
				playing = true;
				$_("section").hide();
				$_("#game").show();
				analyseStatement(label[engine["Step"]]);
				engine["Step"] += 1;
				break;

			case "close":
				$_("[data-ui='" + $_(this).data("close") + "']").removeClass("active");
				break;

			case "close-video":
				var video_player = document.querySelector("[data-ui='player']");
				video_player.pause();
				video_player.currentTime = 0;
				video_player.setAttribute("src", "");
				$_("[data-component='video']").removeClass("active");
				break;

			case "end":
				if (confirm(strings[settings["Language"]]["Confirm"])) {
					endGame();
					engine["Step"] = 0;
				}
				break;

			case "distraction-free":
				event.stopPropagation();
				if ($_(this).hasClass("fa-eye")) {
					$_(this).removeClass("fa-eye");
					$_(this).addClass("fa-eye-slash");
					$_("[data-ui='text']").hide();
				} else if ($_(this).hasClass("fa-eye-slash")) {
					$_(this).removeClass("fa-eye-slash");
					$_(this).addClass("fa-eye")
					$_("[data-ui='text']").show();
				}
				break;

			case "jump":
				stopAmbient();
				label = game[$_(this).data("jump")];
				engine["Step"] = 0;
				playing = true;
				$_("section").hide();
				$_("#game").show();
				analyseStatement(label[engine["Step"]]);
				engine["Step"] += 1;
				break;
		}

	});

	$_("#game [data-action='back']").click(function(event) {
		event.stopPropagation();
		if (!$_("[data-ui='choices']").isVisible() &&
			!$_("[data-component='modal']").isVisible() &&
			!$_("[data-component='video']").isVisible() &&
			$_("#game").isVisible() &&
			!$_("#planner").property("open") &&
			($_("[data-ui='text']").isVisible() ||
				(!$_("[data-ui='text']").isVisible() && $_("[data-ui='centered']").isVisible()))) {

			previous();
		}
	});

	$_("[data-action='back']:not(#game)").click(function(event) {
		event.stopPropagation();
		$_("section").hide();
		if (playing) {
			$_("#game").show();
		} else {
			$_("[data-menu='main']").show();
		}
	});

	/**
	 * ==========================
	 * In-Game Event Handlers
	 * ==========================
	 **/

	$_(document).keyup(function(e) {
		switch (e.which) {
			case 27: // escape
				$_("#game").hide();
				$_("[data-menu='settings']").show();
				break;

			case 32: // spacebar
				if (!$_("[data-ui='choices']").isVisible() &&
					!$_("[data-component='modal']").isVisible() &&
					!$_("[data-component='video']").isVisible() &&
					$_("#game").isVisible() &&
					!$_("#planner").property("open") &&
					($_("[data-ui='text']").isVisible() ||
						(!$_("[data-ui='text']").isVisible() && $_("[data-ui='centered']").isVisible()))) {

					hideCentered();
					shutUp();
					analyseStatement(label[engine["Step"]]);
					engine["Step"] += 1;
				}
				break;

			case 37: // left
				previous();
				break;

			default:
				return; // exit this handler for other keys
		}
		e.preventDefault();
	});

	$_("body").on("click", "[data-do]", function() {
		hideCentered();
		shutUp();
		if ($_(this).data("do") != "null" && $_(this).data("do") != "") {
			var back = ["show", "play", "display", "hide", "scene", "stop", "pause"];
			try {
				if (back.indexOf($_(this).data("do").split(" ")[0]) > -1) {
					engine["Step"] -= 1;
					analyseStatement($_(this).data("do"));
					engine["Step"] += 1;
				} else {
					if ($_(this).data("do").split(" ")[0] == "jump") {
						analyseStatement($_(this).data("do"));
						engine["Step"] += 1;
					} else {
						analyseStatement($_(this).data("do"));
					}
				}

			} catch (e) {
				console.log("An error ocurred while trying to execute the choice's action.\n" + e);
			}
		}
		$_("[data-ui='choices']").hide();
		$_("[data-ui='choices']").html("");
	});

	$_("#game [data-ui='quick-menu'] *").click(function(e) {
		// Clicked Child
		e.stopPropagation();
	});

	$_("#game").click(function(event) {
		if (!$_("[data-ui='choices']").isVisible() &&
			$_("#game").isVisible() &&
			!$_("[data-component='modal']").isVisible() &&
			($_("[data-ui='text']").isVisible() ||
				(!$_("[data-ui='text']").isVisible() && $_("[data-ui='centered']").isVisible())) &&
			!$_("[data-component='video']").isVisible()) {

			hideCentered();
			shutUp();
			analyseStatement(label[engine["Step"]]);
			engine["Step"] += 1;
		}
	});

	/**
	 * =======================
	 * Engine Helper Functions
	 * =======================
	 **/

	function hideCentered() {
		$_("[data-ui='centered']").remove();
		$_("[data-ui='text']").show();
	}

	function playAmbient() {
		if (engine["MenuMusic"] != "") {
			var ambient_player = document.querySelector("[data-component='ambient']");
			ambient_player.setAttribute("loop", "");

			if (typeof music !== 'undefined') {
				if (music[engine["MenuMusic"]] != null) {
					ambient_player.setAttribute("src", "audio/music/" + music[engine["MenuMusic"]]);
				} else {
					ambient_player.setAttribute("src", "audio/music/" + engine["MenuMusic"]);
				}
			} else {
				ambient_player.setAttribute("src", "audio/music/" + engine["MenuMusic"]);
			}
			ambient_player.play();
		}
	}

	// Stop the main menu's music
	function stopAmbient() {
		var a_player = document.querySelector("[data-component='ambient']");
		if (!a_player.paused) {
			a_player.pause();
		}
	}

	// Stop the voice player
	function shutUp() {
		var voice_player = document.querySelector("[data-component='voice']");
		if (!voice_player.paused && voice_player.src != null && voice_player.src != "") {
			voice_player.pause();
			voice_player.currentTime = 0;
		}
	}

	// Function to end the game.
	function endGame() {
		playing = false;
		// Stop any playing music
		for (var i = 0; i < document.getElementsByTagName("audio").length; i++) {
			var v = document.getElementsByTagName("audio");
			if (!v[i].paused && v[i].src != null && v[i].src != "") {
				v[i].pause();
				v[i].currentTime = 0;
			}
		}
		// Hide in-game elements
		$_("[data-component='modal']").removeClass("active");
		$_("[data-ui='messages']").removeClass("active");
		$_("[data-ui='centered']").remove();
		$_("#game img").hide();
		$_("#game").style({
			"background": "initial"
		});
		whipeText();

		// Reset conditions
		engine["Label"] = "Start";
		label = game[engine["Label"]];
		engine["Step"] = -1;
		$_("section").hide();

		// Show main menu
		playAmbient();
		$_("[data-menu='main']").show();
	}

	// Function to execute the next statement in the script.
	function next() {
		engine["Step"] += 1;
		analyseStatement(label[engine["Step"]]);
	}

	// Function to execute the previous statement in the script.
	function previous() {

		hideCentered();
		shutUp();
		if (engine["Step"] >= 2) {
			engine["Step"] -= 2;
			var back = ["show", "play", "display", "hide", "stop"];
			var flag = true;
			try {
				if (typeof label[engine["Step"]] == "string") {
					while (back.indexOf(label[engine["Step"]].split(" ")[0]) > -1 && engine["Step"] > 0 && flag) {
						var parts = replaceVariables(label[engine["Step"]]).split(" ");
						switch (parts[0]) {
							case "show":
								if (characters[parts[1]] != null) {
									$_("[data-character='" + parts[1] + "']").remove();
									if (engine["CharacterHistory"].length > 1) {
										engine["CharacterHistory"].pop()
									}

									var last_character = engine["CharacterHistory"].slice(-1)[0];
									if (last_character != null) {
										if (last_character.indexOf("data-character='" + parts[1] + "'") > -1) {
											$_("#game").append(last_character);
										}
									}

								} else {
									if (parts[3] != null && parts[3] != "") {
										$_("[data-image='" + parts[1] + "']").addClass(parts[3]);
									} else {
										$_("[data-image='" + parts[1] + "']").remove();
									}
									engine["ImageHistory"].pop();
								}
								break;

							case "play":
								if (parts[1] == "music") {
									var music_player = document.querySelector("[data-component='music']");
									music_player.removeAttribute("loop");
									music_player.setAttribute("src", "");
									engine["Song"] = "";
									music_player.pause();
									music_player.currentTime = 0;
								} else if (parts[1] == "sound") {
									var sound_player = document.querySelector("[data-component='sound']");
									sound_player.removeAttribute("loop");
									sound_player.setAttribute("src", "");
									sound_player.pause();
									sound_player.currentTime = 0;
								}
								break;

							case "stop":
								if (parts[1] == "music") {
									var last = engine["MusicHistory"].pop().split(" ");
									var music_player = document.querySelector("[data-component='music']");

									if (last[3] == "loop") {
										music_player.setAttribute("loop", "");
									} else if (last[3] == "noloop") {
										music_player.removeAttribute("loop");
									}
									if (typeof music !== 'undefined') {
										if (music[last[2]] != null) {
											music_player.setAttribute("src", "audio/music/" + music[last[2]]);
										} else {
											music_player.setAttribute("src", "audio/music/" + last[2]);
										}
									} else {
										music_player.setAttribute("src", "audio/music/" + last[2]);
									}
									music_player.play();
									engine["Song"] = last.join(" ");
								} else if (parts[1] == "sound") {
									var last = engine["SoundHistory"].pop().split(" ");
									var sound_player = document.querySelector("[data-component='sound']");

									if (last[3] == "loop") {
										sound_player.setAttribute("loop", "");
									} else if (last[3] == "noloop") {
										sound_player.removeAttribute("loop");
									}

									if (typeof sound !== 'undefined') {
										if (sound[last[2]] != null) {
											sound_player.setAttribute("src", "audio/sound/" + sound[last[2]]);
										} else {
											sound_player.setAttribute("src", "audio/sound/" + last[2]);
										}
									} else {
										sound_player.setAttribute("src", "audio/sound/" + last[2]);
									}

									sound_player.play();
									engine["Sound"] = last.join(" ");
								}
								break;

							case "scene":
								engine["SceneHistory"].pop()
								engine["Scene"] = engine["SceneHistory"].slice(-1)[0];

								if (typeof engine["Scene"] != 'undefined') {
									$_("[data-character]").remove();
									$_("[data-image]").remove();

									if (scenes[parts[1]] != null) {
										$_('#game').style("background", "url(img/scenes/" + scenes[engine["Scene"]] + ") center / cover no-repeat");
									} else {
										$_('#game').style("background", engine["Scene"]);
									}
								}

								whipeText();
								break;

							case "display":
								if (parts[1] == "message") {
									var mess = messages[parts[2]];
									$_("[data-ui='message-content']").html("");
									$_("[data-ui='messages']").removeClass("active");
								} else if (parts[1] == "image") {
									$_("[data-image='" + parts[2] + "']").remove();
								}
								break;
							case "hide":
								if (characters[parts[1]] != null && engine["CharacterHistory"].length > 0) {
									$_("#game").append(engine["CharacterHistory"].pop());

								} else if (images[parts[1]] != null && engine["ImageHistory"] > 0) {
									$_("#game").append(engine["ImageHistory"].pop());

								} else {
									flag = false;
									engine["Step"] += 1;
								}
								break;
						}
						if ((engine["Step"] - 1) >= 0) {
							engine["Step"] -= 1;
						}
					}

				} else if (typeof label[engine["Step"]] == "object") {
					while (typeof label[engine["Step"]] == "object") {

						if ((engine["Step"] - 1) >= 0) {
							engine["Step"] -= 1;
						}
					}
				}
				analyseStatement(label[engine["Step"]]);
				engine["Step"] += 1;
			} catch (e) {
				console.log("An error ocurred while trying to exectute the previous statement.\n" + e);
			}
		}
	}

	function whipeText() {
		$_("[data-ui='who']").html("");
		$_("[data-ui='say']").html("");
	}

	/**
	 * =======================
	 * Statements Functioning
	 * =======================
	 **/

	function replaceVariables(statement) {
		var matches = statement.match(/{{\S+}}/g);
		if (matches != null) {
			for (var i = 0; i < matches.length; i++) {
				var path = matches[i].replace("{{", "").replace("}}", "").split(".");
				var data = storage[path[0]];
				for (var j = 1; j < path.length; j++) {
					data = data[path[j]];
				}
				statement = statement.replace(matches[i], data);
			}
		}

		return statement;

	}

	function analyseStatement(statement) {
		try {

			switch (typeof statement) {
				case "string":
					statement = replaceVariables(statement);
					var parts = statement.split(" ");

					switch (parts[0]) {

						case "play":

							if (parts[1] == "music") {
								var music_player = document.querySelector("[data-component='music']");

								if (parts[3] == "loop") {
									music_player.setAttribute("loop", "");
								} else if (parts[3] == "noloop") {
									music_player.removeAttribute("loop");
								}

								if (typeof music !== 'undefined') {
									if (music[parts[2]] != null) {
										music_player.setAttribute("src", "audio/music/" + music[parts[2]]);
									} else {
										music_player.setAttribute("src", "audio/music/" + parts[2]);
									}
								} else {
									music_player.setAttribute("src", "audio/music/" + parts[2]);
								}

								music_player.play();
								engine["Song"] = parts.join(" ");
								engine["MusicHistory"].push(engine["Song"]);
								next();
							} else if (parts[1] == "sound") {
								var sound_player = document.querySelector("[data-component='sound']");
								if (parts[3] == "loop") {
									sound_player.setAttribute("loop", "");
								} else if (parts[3] == "noloop") {
									sound_player.removeAttribute("loop");
								}

								if (typeof sound !== 'undefined') {
									if (sound[parts[2]] != null) {
										sound_player.setAttribute("src", "audio/sound/" + sound[parts[2]]);
									} else {
										sound_player.setAttribute("src", "audio/sound/" + parts[2]);
									}
								} else {
									sound_player.setAttribute("src", "audio/sound/" + parts[2]);
								}

								sound_player.play();
								engine["Sound"] = parts.join(" ");
								engine["SoundHistory"].push(engine["Sound"]);
								next();
							} else if (parts[1] == "voice") {
								var voice_player = document.querySelector("[data-component='voice']");

								if (typeof voice !== 'undefined') {
									if (voice[parts[2]] != null) {
										voice_player.setAttribute("src", "audio/voice/" + voice[parts[2]]);
									} else {
										voice_player.setAttribute("src", "audio/voice/" + parts[2]);
									}
								} else {
									voice_player.setAttribute("src", "audio/voice/" + parts[2]);
								}

								voice_player.play();
								next();
							} else if (parts[1] == "video") {
								var video_player = document.querySelector("[data-ui='player']");

								if (typeof videos !== 'undefined') {
									if (videos[parts[2]] != null) {
										video_player.setAttribute("src", "video/" + videos[parts[2]]);
									} else {
										video_player.setAttribute("src", "video/" + parts[2]);
									}
								} else {
									video_player.setAttribute("src", "video/" + parts[2]);
								}

								$_("[data-component='video']").addClass("active");
								video_player.play();
							}

							break;

						case "scene":
							$_("[data-character]").remove();
							$_("[data-image]").remove();

							$_('#game').fadeOut(200, function() {

								if (scenes[parts[1]] != null) {
									$_('#game').style("background", "url(img/scenes/" + scenes[parts[1]] + ") center / cover no-repeat");
								} else {
									$_('#game').style("background", parts[1]);
								}

								$_('#game').fadeIn(200);
							});

							engine["Scene"] = parts[1];
							engine["SceneHistory"].push(parts[1]);
							whipeText();
							next();
							break;

						case "show":
							// show [character] [expression] at [position] with [animation]
							//   0      1             2       3     4        5       6

							// show [character] [expression] with [animation]
							//   0      1             2       3       4

							// show [character] [expression]
							//   0      1             2
							if (characters[parts[1]] != null) {
								var directory = characters[parts[1]]["Directory"];
								if (directory == null) {
									directory = "";
								}
								var image = characters[parts[1]]["Images"][parts[2]];
								$_("[data-character='" + parts[1] + "']").remove();

								if (parts[3] == "at") {
									parts[3] == parts[4];
								}

								if (parts[3] == "with" || parts[3] == null) {
									parts[3] = "center";
								}

								var classes = parts.join(" ").replace("show " + parts[1] +" "+ parts[2], "").replace(" at ", "").replace(" with ", " ");


								$_("#game").append("<img src='img/characters/" + directory + "/" + image + "' class='animated " + classes + "' data-character='" + parts[1] + "' data-sprite='" + parts[2] + "'>");
								if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
									if (Screen.isLandscape()) {
										$_("img").style("height", "80%");
									} else {
										$_("img").style("height", "60%");
									}
								}
								engine["CharacterHistory"].push("<img src='img/characters/" + directory + "/" + image + "' class='animated " + classes + "' data-character='" + parts[1] + "' data-sprite='" + parts[2] + "'>");

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

								if (parts[2] == "with" || parts[2] == null) {
									parts[2] = "center";
								}

								if (images[parts[1]] != null) {
									var src = images[parts[1]];
								} else {
									var src = parts[1];
								}

								var classes = parts.join(" ").replace("show " + parts[1], "").replace(" at ", "").replace(" with ", " ");

								var imageObject = "<img src='img/" + src + "' class='animated " + classes + "' data-image='" + parts[1] + "' data-sprite='" + parts[1] + "'>";
								$_("#game").append(imageObject);
								engine["ImageHistory"].push(imageObject);

							}
							next();
							break;

						case "jump":
							engine["Step"] = 0;
							label = game[parts[1]];
							engine["Label"] = parts[1];
							whipeText();
							analyseStatement(label[engine["Step"]]);
							break;

						case "stop":
							if (parts[1] == "music") {
								var music_player = document.querySelector("[data-component='music']");
								music_player.removeAttribute("loop");
								music_player.setAttribute("src", "");
								engine["Song"] = "";
								music_player.pause();
								music_player.currentTime = 0;
							} else if (parts[1] == "sound") {
								var sound_player = document.querySelector("[data-component='sound']");
								sound_player.removeAttribute("loop");
								sound_player.setAttribute("src", "");
								engine["Sound"] = "";
								sound_player.pause();
								sound_player.currentTime = 0;
							} else if (parts[1] == "particles") {
								$_("#particles-js").html("");
							}
							next();
							break;

						case "pause":
							if (parts[1] == "music") {
								var music_player = document.querySelector("[data-component='music']");
								music_player.pause();
							} else if (parts[1] == "sound") {
								var sound_player = document.querySelector("[data-component='sound']");
								sound_player.pause();
							}
							next();
							break;

						case "hide":
							if (characters[parts[1]] != null) {
								if (parts[3] != null && parts[3] != "") {
									$_("[data-character='" + parts[1] + "']").addClass(parts[3]);
								} else {
									$_("[data-character='" + parts[1] + "']").remove();
								}

							} else if (images[parts[1]] != null) {
								if (parts[3] != null && parts[3] != "") {
									$_("[data-image='" + parts[1] + "']").addClass(parts[3]);
								} else {
									$_("[data-image='" + parts[1] + "']").remove();
								}

							} else {
								if (parts[3] != null && parts[3] != "") {
									$_("[data-image='" + parts[1] + "']").addClass(parts[3]);
								} else {
									$_("[data-image='" + parts[1] + "']").remove();
								}
							}
							next();
							break;

						case "display":

							if (parts[1] == "message") {
								if (typeof messages == 'object') {
									var mess = messages[parts[2]];
									$_("[data-ui='message-content']").html("<h3>" + mess["Title"] + "</h3><p>" + mess["Subtitle"] + "</p>" + "<p>" + mess["Message"] + "</p>");
									$_("[data-ui='messages']").addClass("active");
								}
							} else if (parts[1] == "image") {
								if (parts[3] == null) {
									parts[3] = "center";
								}
								if (parts[3] == "with") {
									parts[3] = "center";
									parts[5] = parts[4];
								}
								if (images[parts[2]] != null) {
									$_("#game").append("<img src='img/" + images[parts[2]] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
									engine["ImageHistory"].push("<img src='img/" + images[parts[2]] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
								} else {
									$_("#game").append("<img src='img/" + parts[2] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
									engine["ImageHistory"].push("<img src='img/" + parts[2] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
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
							eval(statement.replace(parts[0] + " ", ""));
							engine["JS"] += statement.replace(parts[0] + " ", "") + "::";
							next();
							break;

						case "clear":
							whipeText();
							break;

						case "centered":
							$_("[data-ui='text']").hide();
							$_("#game").append("<div class='middle align-center' data-ui='centered'>" + statement.replace(parts[0] + " ", "") + "</div>");
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
							next();
							break;

						case "notify":
							if (typeof notifications == 'object') {
								if (notifications[parts[1]] && ("Notification" in window)) {
									// Let's check whether notification permissions have already been granted
									if (Notification.permission === "granted") {
										// If it's okay let's create a notification
										var notification = new Notification(notifications[parts[1]].title, notifications[parts[1]]);

										if (parts[2]) {
											setTimeout(function() {
												notification.close();
											}, parseInt(parts[2]));
										}

									} else if (Notification.permission !== 'denied') {
										Notification.requestPermission(function(permission) {
											// If the user accepts, let's create a notification
											if (permission === "granted") {
												var notification = new Notification(notifications[parts[1]].title, notifications[parts[1]]);
												if (parts[2]) {
													setTimeout(function() {
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
							next();
							break;

						case "particles":
							if (typeof particles == 'object') {
								if (particles[parts[1]]) {
									if (typeof particlesJS != "undefined") {
										particlesJS(particles[parts[1]]);
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
							$_("[data-character]").removeClass("focus");
							if (character.length > 1 && characters[character[0]] != null) {
								if(characters[character[0]] != null) {
									$_("[data-ui='who']").html(characters[character[0]]["Name"]);
									$_("[data-character='" + character[0] + "']").addClass("focus");
									$_("[data-ui='who']").style("color", characters[character[0]]["Color"]);
									document.querySelector("[data-ui='say']").innerHTML = statement.replace(parts[0] + " ", "");
									if (characters[character[0]]["Side"] != null) {
										if (characters[character[0]]["Side"][character[1]] != null && characters[character[0]]["Side"][character[1]] != "") {
											var directory = characters[character[0]]["Directory"];
											if (directory == null) {
												directory = "";
											}
											$_("[data-ui='face']").attribute("src", "img/characters/" + directory + "/" + characters[character[0]]["Side"][character[1]]);
											$_("[data-ui='face']").show();
										} else {
											$_("[data-ui='face']").hide();
										}
									} else {
										$_("[data-ui='face']").hide();
									}

								}
							} else if (characters[parts[0]] != null) {
								$_("[data-ui='who']").html(characters[parts[0]]["Name"]);
								$_("[data-character='" + parts[0] + "']").addClass("focus");
								$_("[data-ui='who']").style("color", characters[parts[0]]["Color"]);
								document.querySelector("[data-ui='say']").innerHTML = statement.replace(parts[0] + " ", "");
								if (characters[parts[0]]["Face"] != null && characters[parts[0]]["Face"] != "") {
									var directory = characters[parts[0]]["Directory"];
									if (directory == null) {
										directory = "";
									}
									$_("[data-ui='face']").attribute("src", "img/characters/" + directory + "/" + characters[parts[0]]["Face"]);
									$_("[data-ui='face']").show();
								} else {
									$_("[data-ui='face']").hide();
								}
							} else {
								// The narrator is speaking
								$_("[data-ui='face']").hide();
								document.querySelector("[data-ui='who']").innerHTML = "";
								document.querySelector("[data-ui='say']").innerHTML = statement;
							}
							break;
					}
					break;

				case "function":
					if (statement()) {
						next();
					}
					break;

				case "object":
					if (statement["Choice"] != null) {
						$_("[data-ui='choices']").html("");
						for (var i in statement["Choice"]) {
							var choice = label[engine["Step"]]["Choice"][i];
							if (choice["Condition"] != null && choice["Condition"] != "") {

								if (eval(label[engine["Step"]]["Choice"][i]["Condition"])) {
									$_("[data-ui='choices']").append("<button data-do='" + choice["Do"] + "'>" + choice["Text"] + "</button>");
								}

							} else {
								if (typeof choice == 'object') {
									$_("[data-ui='choices']").append("<button data-do='" + choice["Do"] + "'>" + choice["Text"] + "</button>");
								} else if (typeof choice == 'string') {
									analyseStatement(choice);
								}

							}



							$_("[data-ui='choices']").show();
						}
					} else if (statement["Conditional"] != null) {
						var condition = statement["Conditional"];
						if (condition["Condition"]()) {
							if (condition["True"].trim() == "") {
								analyseStatement("next");
							} else {
								analyseStatement(condition["True"]);
							}

						} else {
							analyseStatement(condition["False"]);
						}
					} else if (statement["Input"] != null) {
						$_("[data-ui='input'] [data-ui='input-message']").text(statement["Input"]["Text"]);
						$_("[data-ui='input']").addClass("active");

						$_("[data-ui='input'] [data-action='submit']").click(function() {
							var inputValue = $_("[data-ui='input'] input").value();

							if (statement["Input"]["Validation"](inputValue)) {
								statement["Input"]["Save"](inputValue);
								$_("[data-ui='input']").removeClass("active");
								$_("[data-ui='input'] [data-ui='warning']").text("");
								$_("[data-ui='input'] input").value("");
							} else {
								$_("[data-ui='input'] [data-ui='warning']").text(statement["Input"]["Warning"]);
							}

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