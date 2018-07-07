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
'use strict';

/**
 * ======================
 * Initialize Variables
 * ======================
 **/

/* global $_ */
/* global $_ready */
/* global Platform */
/* global Storage */
/* global engine */
/* global messages */
/* global notifications */
/* global particles */
/* global require */
/* global particlesJS */
/* global Typed */
/* global settings */
/* global Monogatari */
/* global globals */

$_ready(() => {

	Monogatari.settings (engine);
	Monogatari.preferences (settings);

	Monogatari.init ();

	const storageStructure = JSON.stringify(Monogatari.storage ());

	/**
	 * ======================
	 * Game Objects
	 * ======================
	 **/

	/**
	 * =======================
	 * Save and Load Functions
	 * =======================
	 **/


	function loadFromSlot (slot) {
		document.body.style.cursor = "wait";
		globals.playing = true;

		resetGame ();

		$_('section').hide();
		$_('#game').show();
		Storage.get (slot).then ((data) => {
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
			Monogatari.storage (Object.assign({}, JSON.parse(storageStructure), data.Storage));

			globals.label = globals.game[data.Label];

			for (const i in data.Show.split(",")) {
				if (data.Show.split(",")[i].trim() != '') {
					$_('#game').append(data.Show.split(",")[i]);
				}
			}

			$_("[data-ui='background']").fadeOut(200, function () {

				if (typeof Monogatari.assets ('scenes', data.Engine.Scene) !== 'undefined') {
					$_("[data-ui='background']").style("background", "url(img/scenes/" + Monogatari.assets ('scenes', data.Engine.Scene) + ") center / cover no-repeat");
				} else {
					$_("[data-ui='background']").style("background", data.Engine.Scene);
				}

				$_("[data-ui='background']").fadeIn(200);
			});

			if (Monogatari.setting ('Song') != '') {
				const parts = Monogatari.setting ('Song').split (' ');
				if (parts[1] == "music") {

					if (parts[3] == "loop") {
						Monogatari.musicPlayer.setAttribute("loop", '');
					} else if (parts[3] == "noloop") {
						Monogatari.musicPlayer.removeAttribute("loop");
					}

					if (typeof Monogatari.assets ('music', parts[2]) != 'undefined') {
						Monogatari.musicPlayer.setAttribute('src', "audio/music/" + Monogatari.assets ('music', parts[2]));
					} else {
						Monogatari.musicPlayer.setAttribute('src', "audio/music/" + parts[2]);
					}

					Monogatari.musicPlayer.play();
				}
			}

			if (Monogatari.setting ('Sound') != '') {
				const parts = Monogatari.setting ('Sound').split (' ');
				if (parts[1] == "sound") {
					if (parts[3] == "loop") {
						Monogatari.soundPlayer.setAttribute("loop", '');
					} else if (parts[3] == "noloop") {
						Monogatari.soundPlayer.removeAttribute("loop");
					}

					if (typeof  Monogatari.assets ('sound', parts[2]) != 'undefined') {
						Monogatari.soundPlayer.setAttribute('src', "audio/sound/" + Monogatari.assets ('sound', parts[2]));
					} else {
						Monogatari.soundPlayer.setAttribute('src', "audio/sound/" + parts[2]);
					}

					Monogatari.soundPlayer.play();
				}
			}

			if (Monogatari.setting ('Particles') != '' && typeof Monogatari.setting ('Particles') == "string") {
				if (typeof particles[Monogatari.setting ('Particles')] !== 'undefined') {
					particlesJS (particles[Monogatari.setting ('Particles')]);
				}
			}

			$_('#game').show();
			analyseStatement(globals.label[Monogatari.setting ('Step')]);
			document.body.style.cursor = "auto";
		});
	}

	/**
	 * =======================
	 * Save and Load Events
	 * =======================
	 **/

	// Load a saved game slot when it is pressed
	$_("[data-menu='load'] [data-ui='saveSlots']").on("click", "figcaption, img", function () {
		loadFromSlot (Monogatari.setting ('SaveLabel') + $_(this).parent().data("loadSlot"));
	});

	// Load an autosaved game slot when it is pressed
	$_("[data-menu='load'] [data-ui='autoSaveSlots']").on("click", "figcaption, img", function () {
		loadFromSlot (Monogatari.setting ('AutoSaveLabel') + $_(this).parent().data("loadSlot"));
	});



	/**
	 * =======================
	 * Settings Event Handlers
	 * =======================
	 **/



	// Language select listener
	$_("[data-action='set-language']").change(function () {
		globals.game =  Monogatari.script (Monogatari.preference ('Language'));
		globals.label = globals.game[Monogatari.setting ('Label')];
	});

	/**
	 * ==========================
	 * Game Quick Start
	 * ==========================
	 **/

	// Start game automatically withouth going trough the main menu
	function showMainMenu () {
		if (!Monogatari.setting ('ShowMenu')) {
			Monogatari.stopAmbient();
			globals.playing = true;
			$_('section').hide ();
			$_('#game').show ();
			analyseStatement(globals.label[Monogatari.setting ('Step')]);
		} else {
			$_("[data-menu='main']").show();
		}
	}


	/**
	 * ==========================
	 * Preload Assets
	 * ==========================
	 **/
	Monogatari.preload ().then(() => {
		$_('[data-menu="loading"]').fadeOut (400, () => {
			$_('[data-menu="loading"]').hide ();
		});
	}).catch ((e) => {
		console.error (e);
	}).finally (() => {
		showMainMenu ();
	});

	/**
	 * ==========================
	 * Data-Action Event Handlers
	 * ==========================
	 **/

	$_("[data-action]").click(function (event) {

		switch ($_(this).data("action")) {

			case "open-menu":
				$_('section').hide();

				if ($_(this).data("open") == "save") {
					$_("[data-menu='save'] [data-input='slotName']").value (Monogatari.niceDateTime ());
				}

				$_("[data-menu='" + $_(this).data("open") + "']").show();

				break;

			case "pause":
				break;

			case "start":
				Monogatari.stopAmbient();
				globals.playing = true;
				$_('section').hide();
				$_('#game').show();
				analyseStatement(globals.label[Monogatari.setting ('Step')]);
				break;

			case "close":
				$_("[data-ui='" + $_(this).data("close") + "']").removeClass("active");
				break;

			case "close-video":
				Monogatari.stopVideo();
				break;

			case "quit":
				$_("[data-notice='exit']").removeClass("modal--active");
				endGame();
				break;

			case "dismiss-notice":
				$_("[data-notice]").removeClass("modal--active");
				break;

			case "end":
				$_("[data-notice='exit']").addClass("modal--active");
				break;

			case "distraction-free":
				if ($_(this).hasClass("fa-eye")) {
					$_(this).removeClass("fa-eye");
					$_(this).addClass("fa-eye-slash");
					$_(this).parent ().find ("[data-string]").text (Monogatari.string ("Show"));
					$_("[data-ui='quick-menu']").addClass ("transparent");
					$_("[data-ui='text']").hide();
				} else if ($_(this).hasClass("fa-eye-slash")) {
					$_(this).removeClass("fa-eye-slash");
					$_(this).addClass("fa-eye");
					$_(this).parent ().find ("[data-string]").text (Monogatari.string ("Hide"));
					$_("[data-ui='quick-menu']").removeClass ("transparent");
					$_("[data-ui='text']").show();
				} else if ($_(this).text () === Monogatari.string ("Show")) {
					$_(this).text (Monogatari.string("Hide"));
					$_(this).parent ().find (".fas").removeClass ("fa-eye-slash");
					$_(this).parent ().find (".fas").addClass ("fa-eye");
					$_("[data-ui='quick-menu']").removeClass ("transparent");
					$_("[data-ui='text']").show ();
				} else if ($_(this).text () === Monogatari.string ("Hide")) {
					$_(this).text (Monogatari.string ("Show"));
					$_(this).parent ().find (".fas").removeClass ("fa-eye");
					$_(this).parent ().find (".fas").addClass ("fa-eye-slash");
					$_("[data-ui='quick-menu']").addClass ("transparent");
					$_("[data-ui='text']").hide ();
				}
				break;

			case "auto-play":
				if ($_(this).hasClass("fa-play-circle")) {
					$_(this).removeClass("fa-play-circle");
					$_(this).addClass("fa-stop-circle");
					globals.autoPlay = setTimeout (function () {
						if (Monogatari.canProceed() && globals.finishedTyping) {
							Monogatari.hideCentered();
							Monogatari.shutUp();
							next ();
						}
					}, Monogatari.preference ('AutoPlaySpeed') * 1000);
				} else if ($_(this).hasClass("fa-stop-circle")) {
					$_(this).removeClass("fa-stop-circle");
					$_(this).addClass("fa-play-circle");
					clearTimeout (globals.autoPlay);
					globals.autoPlay = null;
				} else if ($_(this).text () === Monogatari.string ("AutoPlay")) {
					$_(this).text (Monogatari.string("Stop"));
					globals.autoPlay = setTimeout(function () {
						if (Monogatari.canProceed() && globals.finishedTyping) {
							Monogatari.hideCentered();
							Monogatari.shutUp();
							next ();
						}
					}, Monogatari.preference ('AutoPlaySpeed') * 1000);
				} else if ($_(this).text () === Monogatari.string ("Stop")) {
					$_(this).text (Monogatari.string ("AutoPlay"));
					clearTimeout (globals.autoPlay);
					globals.autoPlay = null;
				}
				break;

			case "jump":
				Monogatari.stopAmbient();
				globals.label = globals.game[$_(this).data("jump")];
				Monogatari.setting ('Step', 0);
				globals.playing = true;
				$_('section').hide();
				$_('#game').show();
				analyseStatement(globals.label[Monogatari.setting ('Step')]);
				break;

			case "save":
				var slotName = $_("[data-menu='save'] [data-input='slotName']").value ().trim ();
				if (slotName !== '') {
					Monogatari.newSave (slotName);
				}
				break;

			case "delete-slot":
				Storage.remove (Monogatari.setting ('SaveLabel') + globals.deleteSlot);
				$_(`[data-load-slot='${globals.deleteSlot}'], [data-save='${globals.deleteSlot}']`).remove ();
				globals.deleteSlot = null;
				$_("[data-notice='slot-deletion']").removeClass ("modal--active");
				break;

			case "overwrite-slot":
				var customName = $_("[data-notice='slot-overwrite'] input").value ().trim ();
				if (customName !== '') {
					Monogatari.saveToSlot (globals.overwriteSlot, Monogatari.setting ('SaveLabel') + globals.overwriteSlot, customName);
					globals.overwriteSlot = null;
					$_("[data-notice='slot-overwrite']").removeClass ("modal--active");
				}
				break;
		}
		return false;
	});

	$_("#game [data-action='back'], #game [data-action='back'] *").click(function (event) {
		event.stopPropagation ();
		if (Monogatari.canProceed ()) {
			previous ();
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
					if ($_('#game').isVisible()) {
						$_('#game').hide();
						$_("[data-menu='settings']").show();
					}
					break;

				// Spacebar and Right Arrow
				case 32:
				case 39:
					if (Monogatari.canProceed()) {
						if (!globals.finishedTyping && typeof globals.textObject !== 'undefined') {
							const str = globals.textObject.strings [0];
							const element = $_(globals.textObject.el).data ("ui");
							globals.textObject.destroy ();
							if (element == "centered") {
								$_("[data-ui='centered']").html (str);
							} else {
								$_("[data-ui='say']").html (str);
							}
							globals.finishedTyping = true;
						} else {
							Monogatari.hideCentered();
							Monogatari.shutUp();
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
		Monogatari.hideCentered();
		Monogatari.shutUp();
		if ($_(this).data("do") != "null" && $_(this).data("do") != '') {
			try {
				$_("[data-ui='choices']").hide();
				$_("[data-ui='choices']").html('');
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

	$_('#game').click(function () {
		if (Monogatari.canProceed()) {
			if (!globals.finishedTyping && typeof globals.textObject !== 'undefined') {
				const str = globals.textObject.strings [0];
				const element = $_(globals.textObject.el).data ("ui");
				globals.textObject.destroy ();
				if (element == "centered") {
					$_("[data-ui='centered']").html (str);
				} else {
					$_("[data-ui='say']").html (str);
				}
				globals.finishedTyping = true;
			} else {
				Monogatari.hideCentered ();
				Monogatari.shutUp();
				next ();
			}
		}
	});

	/**
	 * =======================
	 * Engine Helper Functions
	 * =======================
	 **/

	function displayDialog (dialog, character, animation) {

		// Destroy the previous textObject so the text is rewritten.
		// If not destroyed, the text would be appended instead of replaced.
		if (typeof globals.textObject != 'undefined') {
			globals.textObject.destroy ();
		}

		// Remove contents from the dialog area.
		$_("[data-ui='say']").html ('');
		$_("[data-ui='say']").data ("speaking", character);

		// Check if the typing animation flag is set to true in order to show it
		if (animation === true) {

			// If the property is set to true, the animation will be shown
			// if it is set to false, even if the flag was set to true,
			// no animation will be shown in the game.
			if (Monogatari.setting ('TypeAnimation') === true) {
				globals.typedConfiguration.strings = [dialog];
				globals.textObject = new Typed ("[data-ui='say']", globals.typedConfiguration);
			} else {
				$_("[data-ui='say']").html (dialog);
				if (globals.autoPlay !== null) {
					globals.autoPlay = setTimeout (function () {
						if (Monogatari.canProceed() && globals.finishedTyping) {
							Monogatari.hideCentered();
							Monogatari.shutUp();
							next ();
						}
					}, Monogatari.preference ('AutoPlaySpeed') * 1000);
				}
				globals.finishedTyping = true;
			}
		} else {
			$_("[data-ui='say']").html (dialog);
			if (globals.autoPlay !== null) {
				globals.autoPlay = setTimeout (function () {
					if (Monogatari.canProceed() && globals.finishedTyping) {
						Monogatari.hideCentered();
						Monogatari.shutUp();
						next ();
					}
				}, Monogatari.preference ('AutoPlaySpeed') * 1000);
			}
			globals.finishedTyping = true;
		}
	}

	function resetGame () {
		Monogatari.stopVideo();
		Monogatari.silence();
		hideGameElements();

		clearInterval (globals.autoPlay);
		globals.autoPlay = null;

		$_("[data-action='auto-play'].fa").removeClass("fa-stop-circle");
		$_("[data-action='auto-play'].fa").addClass("fa-play-circle");

		// Reset Storage
		Monogatari.storage (JSON.parse(storageStructure));

		// Reset Conditions
		Monogatari.setting ('Label', Monogatari.setting ('startLabel'));
		globals.label = globals.game[Monogatari.setting ('Label')];
		Monogatari.setting ('Step', 0);

		// Reset History
		Monogatari.setting ('MusicHistory', []);
		Monogatari.setting ('SoundHistory', []);
		Monogatari.setting ('ImageHistory', []);
		Monogatari.setting ('CharacterHistory', []);
		Monogatari.setting ('SceneHistory', []);
		Monogatari.setting ('SceneElementsHistory', []);
		Monogatari.setting ('ParticlesHistory', []);

		// Reset other States
		Monogatari.setting ('Sound', '');
		Monogatari.setting ('Song', '');
		Monogatari.setting ('Particles', '');
		Monogatari.setting ('Scene', '');
	}



	function hideGameElements () {
		// Hide in-game elements
		$_("[data-ui='choices']").hide();
		$_("[data-ui='choices']").html('');

		$_("[data-component='modal']").removeClass("active");
		$_("[data-ui='messages']").removeClass("active");
		$_("[data-component='video']").removeClass("active");

		$_("[data-ui='centered']").remove();
		$_("#game [data-character]").remove();
		$_("#game [data-image]").remove();

		$_("[data-ui='input'] [data-ui='warning']").text('');

		$_("[data-ui='background']").style("background", "initial");
		whipeText();
	}







	// Function to end the game.
	function endGame () {
		globals.playing = false;

		resetGame ();

		// Show main menu
		$_('section').hide();
		Monogatari.playAmbient();
		$_("[data-menu='main']").show();
	}

	// Function to execute the next statement in the script.
	function next () {
		Monogatari.setting ('Step', Monogatari.setting ('Step') + 1);
		analyseStatement (globals.label[Monogatari.setting ('Step')]);
	}



	// Function to execute the previous statement in the script.
	function previous () {

		Monogatari.hideCentered();
		Monogatari.shutUp();
		if (Monogatari.setting ('Step') >= 1) {
			Monogatari.setting ('Step',Monogatari.setting ('Step') - 1);
			const back = ["show", "play", "display", "hide", "stop", "particles", "wait", "scene", "clear", "vibrate", "notify", "next"];
			let flag = true;
			try {
				while (Monogatari.setting ('Step') > 0 && flag) {
					if (typeof globals.label[Monogatari.setting ('Step')] == "string") {
						if (back.indexOf(globals.label[Monogatari.setting ('Step')].split(' ')[0]) > -1) {
							const parts = Monogatari.replaceVariables(globals.label[Monogatari.setting ('Step')]).split(' ');
							switch (parts[0]) {
								case "show":
									if (typeof Monogatari.character (parts[1]) != 'undefined') {
										$_("[data-character='" + parts[1] + "']").remove();
										if (Monogatari.setting ('CharacterHistory').length > 1) {
											Monogatari.setting ('CharacterHistory').pop();
										}

										const last_character = Monogatari.setting ('CharacterHistory').slice(-1)[0];
										if (typeof last_character != 'undefined') {
											if (last_character.indexOf("data-character='" + parts[1] + "'") > -1) {
												$_('#game').append(last_character);
											}
										}
									} else {
										if (typeof parts[3] != 'undefined' && parts[3] != '') {
											$_("[data-image='" + parts[1] + "']").addClass(parts[3]);
										} else {
											$_("[data-image='" + parts[1] + "']").remove();
										}
										Monogatari.setting ('ImageHistory').pop();
									}
									break;

								case "play":
									if (parts[1] == "music") {
										Monogatari.musicPlayer.removeAttribute("loop");
										Monogatari.musicPlayer.setAttribute('src', '');
										Monogatari.setting ('Song', '');
										Monogatari.musicPlayer.pause();
										Monogatari.musicPlayer.currentTime = 0;
									} else if (parts[1] == "sound") {
										Monogatari.soundPlayer.removeAttribute("loop");
										Monogatari.soundPlayer.setAttribute('src', '');
										Monogatari.setting ('Sound', '');
										Monogatari.soundPlayer.pause();
										Monogatari.soundPlayer.currentTime = 0;
									}
									break;

								case "stop":
									if (parts[1] == "music") {
										const last_song = Monogatari.setting ('MusicHistory').pop().split(' ');

										if (last_song[3] == "loop") {
											Monogatari.musicPlayer.setAttribute("loop", '');
										} else if (last_song[3] == "noloop") {
											Monogatari.musicPlayer.removeAttribute("loop");
										}
										if (typeof music[last_song[2]] != 'undefined') {
											Monogatari.musicPlayer.setAttribute('src', "audio/music/" + Monogatari.assets ('music', last_song[2]));
										} else {
											Monogatari.musicPlayer.setAttribute('src', "audio/music/" + last_song[2]);
										}
										Monogatari.musicPlayer.play();
										Monogatari.setting ('Song', last_song.join(' '));
									} else if (parts[1] == "sound") {
										const last = Monogatari.setting ('SoundHistory').pop().split(' ');

										if (last[3] == "loop") {
											Monogatari.soundPlayer.setAttribute("loop", '');
										} else if (last[3] == "noloop") {
											Monogatari.soundPlayer.removeAttribute("loop");
										}

										if (typeof sound[last[2]] != 'undefined') {
											Monogatari.soundPlayer.setAttribute('src', "audio/sound/" + Monogatari.assets ('sound', last[2]));
										} else {
											Monogatari.soundPlayer.setAttribute('src', "audio/sound/" + last[2]);
										}

										Monogatari.soundPlayer.play();
										Monogatari.setting ('Sound', last.join(' '));
									} else if (parts[1] == "particles") {
										if (typeof Monogatari.setting ('ParticlesHistory') === "object") {
											if (Monogatari.setting ('ParticlesHistory').length > 0) {
												var last_particles = Monogatari.setting ('ParticlesHistory').pop ();
												if (typeof particles[last_particles] !== 'undefined') {
													particlesJS (particles[last_particles]);
													Monogatari.setting ('Particles', last_particles);
												}
											}
										}
									}
									break;

								case "scene":
									Monogatari.setting ('SceneHistory').pop();
									Monogatari.setting ('Scene', Monogatari.setting ('SceneHistory').slice(-1)[0]);

									if (typeof Monogatari.setting ('Scene') != 'undefined') {
										$_("[data-character]").remove();
										$_("[data-image]").remove();
										$_("[data-ui='background']").removeClass ();

										if (typeof Monogatari.assets ('scenes', Monogatari.setting ('Scene')) !== 'undefined') {
											$_("[data-ui='background']").style("background", "url(img/scenes/" + Monogatari.assets ('scenes', Monogatari.setting ('Scene')) + ") center / cover no-repeat");
										} else {
											$_("[data-ui='background']").style("background", Monogatari.setting ('Scene'));
										}

										if (typeof  Monogatari.setting ('SceneElementsHistory') !== 'undefined') {
											if (Monogatari.setting ('SceneElementsHistory').length > 0) {
												var scene_elements = Monogatari.setting ('SceneElementsHistory').pop ();

												if (typeof scene_elements === "object") {
													for (const element of scene_elements) {
														$_('#game').append (element);
													}
												}
											}
										} else {
											Monogatari.setting ('SceneElementsHistory', []);
										}
									}

									whipeText();
									break;

								case "display":
									if (parts[1] == "message") {
										$_("[data-ui='message-content']").html('');
										$_("[data-ui='messages']").removeClass("active");
									} else if (parts[1] == "image") {
										$_("[data-image='" + parts[2] + "']").remove();
									}
									break;
								case "hide":
									if (typeof Monogatari.character (parts[1]) != 'undefined' && Monogatari.setting ('CharacterHistory').length > 0) {
										$_('#game').append(Monogatari.setting ('CharacterHistory').pop());

									} else if (typeof Monogatari.assets ('images', parts[1]) != 'undefined' && Monogatari.setting ('ImageHistory') > 0) {
										$_('#game').append(Monogatari.setting ('ImageHistory').pop());

									} else {
										flag = false;
										Monogatari.setting ('Step', Monogatari.setting ('Step') + 1);
									}
									break;

								case "particles":
									Monogatari.stopParticles ();
									break;
								default:
									flag = false;
									break;
							}
							if ((Monogatari.setting ('Step') - 1) >= 0) {
								Monogatari.setting ('Step', Monogatari.setting ('Step') - 1);
							}
						} else {
							flag = false;
						}
					} else if (typeof globals.label[Monogatari.setting ('Step')] == "object") {
						if (typeof globals.label[Monogatari.setting ('Step')].Function !== 'undefined') {
							Monogatari.assertAsync(globals.label[Monogatari.setting ('Step')].Function.Reverse).then(function () {
								globals.block = false;
							}).catch(function () {
								globals.block = false;
							});
						}
						if ((Monogatari.setting ('Step') - 1) >= 0) {
							Monogatari.setting ('Step', Monogatari.setting ('Step') - 1);
						}
					} else {
						flag = false;
						Monogatari.setting ('Step',  Monogatari.setting ('Step') + 1);
					}
				}
				analyseStatement (globals.label[Monogatari.setting ('Step')]);
			} catch (e) {
				console.error("An error ocurred while trying to exectute the previous statement.\n" + e);
			}
		}
	}

	function whipeText () {
		if (typeof globals.textObject != 'undefined') {
			globals.textObject.destroy ();
		}
		$_("[data-ui='who']").html('');
		$_("[data-ui='say']").html('');
	}

	/**
	 * =======================
	 * Statements Functioning
	 * =======================
	 **/

	function analyseStatement (statement, advance) {
		if (typeof advance !== "boolean") {
			advance = true;
		}
		try {

			switch (typeof statement) {
				case "string":
					statement = Monogatari.replaceVariables(statement);
					var parts = statement.split(' ');

					switch (parts[0]) {

						case "wait":
							globals.block = true;
							setTimeout(function () {
								globals.block = false;
								if (advance) {
									next ();
								}
							}, parseInt (parts[1]));
							break;

						case "play":

							if (parts[1] == "music") {

								if (parts[3] == "loop") {
									Monogatari.musicPlayer.setAttribute("loop", '');
								} else if (parts[3] == "noloop") {
									Monogatari.musicPlayer.removeAttribute("loop");
								}

								if (typeof music !== 'undefined') {
									if (typeof music[parts[2]] != 'undefined') {
										Monogatari.musicPlayer.setAttribute('src', "audio/music/" + Monogatari.assets ('music', parts[2]));
									} else {
										Monogatari.musicPlayer.setAttribute('src', "audio/music/" + parts[2]);
									}
								} else {
									Monogatari.musicPlayer.setAttribute('src', "audio/music/" + parts[2]);
								}

								Monogatari.musicPlayer.play();
								Monogatari.setting ('Song', parts.join(' '));
								Monogatari.setting ('MusicHistory').push(Monogatari.setting ('Song'));
								if (advance) {
									next ();
								}
							} else if (parts[1] == "sound") {
								if (parts[3] == "loop") {
									Monogatari.soundPlayer.setAttribute("loop", '');
								} else if (parts[3] == "noloop") {
									Monogatari.soundPlayer.removeAttribute("loop");
								}
								if (typeof sound[parts[2]] != 'undefined') {
									Monogatari.soundPlayer.setAttribute('src', "audio/sound/" + Monogatari.assets ('sound', parts[2]));
								} else {
									Monogatari.soundPlayer.setAttribute('src', "audio/sound/" + parts[2]);
								}

								Monogatari.soundPlayer.play();
								Monogatari.setting ('Sound', parts.join(' '));
								Monogatari.setting ('SoundHistory').push(Monogatari.setting ('Sound'));
								if (advance) {
									next ();
								}
							} else if (parts[1] == "voice") {

								if (typeof voice[parts[2]] != 'undefined') {
									Monogatari.voicePlayer.setAttribute('src', "audio/voice/" + Monogatari.assets ('voice', parts[2]));
								} else {
									Monogatari.voicePlayer.setAttribute('src', "audio/voice/" + parts[2]);
								}

								Monogatari.voicePlayer.play();
								if (advance) {
									next ();
								}
							} else if (parts[1] == "video") {

								if (typeof videos[parts[2]] != 'undefined') {
									Monogatari.videoPlayer.setAttribute('src', "video/" + Monogatari.assets ('video', parts[2]));
								} else {
									Monogatari.videoPlayer.setAttribute('src', "video/" + parts[2]);
								}

								$_("[data-component='video']").addClass("active");
								Monogatari.videoPlayer.play();
							}

							break;

						case "scene":

							var scene_elements = [];
							$_("#game img:not([data-ui='face']):not([data-visibility='invisible'])").each(function (element) {
								scene_elements.push (element.outerHTML);
							});
							if (typeof Monogatari.setting ('SceneElementsHistory') !== "object") {
								Monogatari.setting ('SceneElementsHistory', []);
							}
							Monogatari.setting ('SceneElementsHistory').push (scene_elements);

							$_("[data-character]").remove();
							$_("[data-image]").remove();
							$_("[data-ui='background']").removeClass();

							// scene [scene]
							//   0      1
							if (typeof Monogatari.assets ('scenes', parts[1]) != 'undefined') {
								$_("[data-ui='background']").style("background", "url(img/scenes/" + Monogatari.assets ('scenes', parts[1]) + ") center / cover no-repeat");
							} else {
								$_("[data-ui='background']").style("background", parts[1]);
							}

							// Check if an animation or class was provided
							// scene [scene] with [animation] [infinite]
							//   0      1     2       3           4
							if (parts.length > 2) {
								if (parts[2] == "with" && parts[3].trim != '') {
									$_("[data-ui='background']").addClass ("animated");
									var class_list = (parts.join(' ').replace ("scene " + parts[1], '').replace (" with ", ' ')).trim ().split (' ');
									for (const newClass of class_list) {
										$_("[data-ui='background']").addClass (newClass);
									}
								}
							}

							Monogatari.setting ('Scene', parts[1]);
							Monogatari.setting ('SceneHistory').push(parts[1]);
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
							var classes = '';
							if (typeof Monogatari.character (parts[1]) != 'undefined') {
								let directory = Monogatari.character (parts[1]).Directory;
								if (typeof directory == 'undefined') {
									directory = '';
								} else {
									directory += "/";
								}
								const image = Monogatari.character (parts[1]).Images[parts[2]];
								$_("[data-character='" + parts[1] + "']").remove();

								if (parts[3] == "at") {
									parts[3] == parts[4];
								}

								if (parts[3] == "with" || typeof parts[3] == 'undefined') {
									parts[3] = "center";
								}

								classes = parts.join(' ').replace("show " + parts[1] +' '+ parts[2], '').replace(" at ", '').replace(" with ", ' ');


								$_('#game').append("<img src='img/characters/" + directory + image + "' class='animated " + classes + "' data-character='" + parts[1] + "' data-sprite='" + parts[2] + "'>");
								Monogatari.setting ('CharacterHistory').push("<img src='img/characters/" + directory + image + "' class='animated " + classes + "' data-character='" + parts[1] + "' data-sprite='" + parts[2] + "'>");

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

								if (parts[2] == "with" || typeof parts[2] == 'undefined') {
									parts[2] = "center";
								}

								let src = '';
								if (typeof Monogatari.assets ('images', parts[1]) != 'undefined') {
									src = Monogatari.assets ('images', parts[1]);
								} else {
									src = parts[1];
								}

								classes = parts.join(' ').replace("show " + parts[1], '').replace(" at ", '').replace(" with ", ' ');

								const imageObject = "<img src='img/" + src + "' class='animated " + classes + "' data-image='" + parts[1] + "' data-sprite='" + parts[1] + "'>";
								$_('#game').append(imageObject);
								Monogatari.setting ('ImageHistory').push(imageObject);

							}
							if (advance) {
								next ();
							}
							break;

						case "jump":
							Monogatari.setting ('Step', 0);
							globals.label = globals.game[parts[1]];
							Monogatari.setting ('Label', parts[1]);
							whipeText();
							analyseStatement(globals.label[Monogatari.setting ('Step')]);
							break;

						case "stop":
							if (parts[1] == "music") {
								Monogatari.musicPlayer.removeAttribute("loop");
								Monogatari.musicPlayer.setAttribute('src', '');
								Monogatari.setting ('Song', '');
								Monogatari.musicPlayer.pause();
								Monogatari.musicPlayer.currentTime = 0;
							} else if (parts[1] == "sound") {
								Monogatari.soundPlayer.removeAttribute("loop");
								Monogatari.soundPlayer.setAttribute('src', '');
								Monogatari.setting ('Sound', '');
								Monogatari.soundPlayer.pause();
								Monogatari.soundPlayer.currentTime = 0;
							} else if (parts[1] == "particles") {
								Monogatari.stopParticles ();
							}
							if (advance) {
								next ();
							}
							break;

						case "pause":
							if (parts[1] == "music") {
								Monogatari.musicPlayer.pause();
							} else if (parts[1] == "sound") {
								Monogatari.soundPlayer.pause();
							}
							if (advance) {
								next ();
							}
							break;

						case "hide":
							if (typeof Monogatari.character (parts[1]) != 'undefined') {
								if (typeof parts[3] != 'undefined' && parts[3] != '') {
									$_("[data-character='" + parts[1] + "']").addClass(parts[3]);
									$_("[data-character='" + parts[1] + "']").data ("visibility", "invisible");
								} else {
									$_("[data-character='" + parts[1] + "']").remove();
								}

							} else if (typeof Monogatari.assets ('images', parts[1]) != 'undefined') {
								if (typeof parts[3] != 'undefined' && parts[3] != '') {
									$_("[data-image='" + parts[1] + "']").addClass(parts[3]);
									$_("[data-image='" + parts[1] + "']").data ("visibility", "invisible");
								} else {
									$_("[data-image='" + parts[1] + "']").remove();
								}

							} else {
								if (typeof parts[3] != 'undefined' && parts[3] != '') {
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
								if (typeof parts[3] === 'undefined') {
									parts[3] = "center";
								}
								if (parts[3] == "with") {
									parts[3] = "center";
									parts[5] = parts[4];
								}
								if (typeof Monogatari.assets ('images', parts[2]) !== 'undefined') {
									$_('#game').append("<img src='img/" + Monogatari.assets ('images', parts[2]) + "' class='animated " + parts[5] + ' ' + parts[3] + "' data-image='" + parts[2] + "'>");
									Monogatari.setting ('ImageHistory').push("<img src='img/" + Monogatari.assets ('images', parts[2]) + "' class='animated " + parts[5] + ' ' + parts[3] + "' data-image='" + parts[2] + "'>");
								} else {
									$_('#game').append("<img src='img/" + parts[2] + "' class='animated " + parts[5] + ' ' + parts[3] + "' data-image='" + parts[2] + "'>");
									Monogatari.setting ('ImageHistory').push("<img src='img/" + parts[2] + "' class='animated " + parts[5] + ' ' + parts[3] + "' data-image='" + parts[2] + "'>");
								}

							}
							break;

						case "end":
							endGame();
							break;

						case "next":
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
							$_('#game').append("<div class='middle align-center' data-ui='centered'></div>");
							if (Monogatari.setting ('TypeAnimation')) {
								if (Monogatari.setting ('CenteredTypeAnimation')) {
									globals.typedConfiguration.strings = [statement.replace(parts[0] + ' ', '')];
									globals.textObject = new Typed ("[data-ui='centered']", globals.typedConfiguration);
								} else {
									$_("[data-ui='centered']").html (statement.replace(parts[0] + ' ', ''));
								}
							} else {
								$_("[data-ui='centered']").html (statement.replace(parts[0] + ' ', ''));
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
									if (typeof particlesJS != 'undefined') {
										particlesJS(particles[parts[1]]);
										if (typeof Monogatari.setting ('ParticlesHistory') !== "object") {
											Monogatari.setting ('ParticlesHistory', []);
										}
										Monogatari.setting ('ParticlesHistory').push (parts[1]);
										Monogatari.setting ('Particles', parts[1]);
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
							if (character.length > 1 && typeof Monogatari.character (character[0]) !== 'undefined') {
								if (typeof Monogatari.character (character[0]).Name !== 'undefined') {
									$_("[data-ui='who']").html(Monogatari.replaceVariables(Monogatari.character (character[0]).Name));
								} else {
									document.querySelector("[data-ui='who']").innerHTML = '';
								}
								$_("[data-character='" + character[0] + "']").addClass("focus");
								$_("[data-ui='who']").style("color", Monogatari.character (character[0]).Color);

								// Check if the character object defines if the type animation should be used.
								if (typeof Monogatari.character (character[0]).TypeAnimation !== 'undefined') {
									if (Monogatari.character (character[0]).TypeAnimation === true) {
										displayDialog (statement.replace(parts[0] + ' ', ''), character[0], true);
									} else {
										displayDialog (statement.replace(parts[0] + ' ', ''), character[0], false);
									}
								} else {
									displayDialog (statement.replace(parts[0] + ' ', ''), character[0], true);
								}

								if (typeof Monogatari.character (character[0]).Side != 'undefined') {
									if (typeof Monogatari.character (character[0]).Side[character[1]] != 'undefined' && Monogatari.character (character[0]).Side[character[1]] != '') {
										directory = Monogatari.character (character[0]).Directory;
										if (typeof directory == 'undefined') {
											directory = '';
										} else {
											directory += "/";
										}
										$_("[data-ui='face']").attribute('src', "img/characters/" + directory + Monogatari.character (character[0]).Side[character[1]]);
										$_("[data-ui='face']").show();
									} else {
										$_("[data-ui='face']").hide();
									}
								} else {
									$_("[data-ui='face']").hide();
								}
							} else if (typeof Monogatari.character (parts[0]) != 'undefined') {
								if (typeof Monogatari.character (character[0]).Name !== 'undefined') {
									$_("[data-ui='who']").html(Monogatari.replaceVariables(Monogatari.character (character[0]).Name));
								} else {
									document.querySelector("[data-ui='who']").innerHTML = '';
								}
								$_("[data-character='" + parts[0] + "']").addClass("focus");
								$_("[data-ui='who']").style("color", Monogatari.character (parts[0]).Color);

								// Check if the character object defines if the type animation should be used.
								if (typeof Monogatari.character (character[0]).TypeAnimation !== 'undefined') {
									if (Monogatari.character (character[0]).TypeAnimation === true) {
										displayDialog (statement.replace(parts[0] + ' ', ''), character[0], true);
									} else {
										displayDialog (statement.replace(parts[0] + ' ', ''), character[0], false);
									}
								} else {
									displayDialog (statement.replace(parts[0] + ' ', ''), character[0], true);
								}

								if (typeof Monogatari.character (parts[0]).Face != 'undefined' && Monogatari.character (parts[0]).Face != '') {
									directory = Monogatari.character (parts[0]).Directory;
									if (typeof directory == 'undefined') {
										directory = '';
									} else {
										directory += "/";
									}
									$_("[data-ui='face']").attribute('src', "img/characters/" + directory + Monogatari.character (parts[0]).Face);
									$_("[data-ui='face']").show();
								} else {
									$_("[data-ui='face']").hide();
								}
							} else {
								// The narrator is speaking
								$_("[data-ui='face']").hide();
								document.querySelector("[data-ui='who']").innerHTML = '';

								if (typeof Monogatari.setting ('NarratorTypeAnimation') !== 'undefined') {
									if (Monogatari.setting ('NarratorTypeAnimation') === true) {
										displayDialog (statement, "narrator", true);
									} else {
										displayDialog (statement, "narrator", false);
									}
								} else {
									displayDialog (statement, "narrator", true);
								}
							}
							break;
					}
					break;

				case "function":
					Monogatari.assertAsync(statement).then(function () {
						globals.block = false;
						if (advance) {
							next ();
						}
					}).catch(function () {
						globals.block = false;
					});
					break;

				case "object":
					if (typeof statement.Choice != 'undefined') {
						$_("[data-ui='choices']").html('');
						for (const i in statement.Choice) {
							const choice = statement.Choice[i];
							if (typeof choice.Condition != 'undefined' && choice.Condition != '') {

								Monogatari.assertAsync(statement.Choice[i].Condition).then(function () {
									if (typeof choice.Class != 'undefined') {
										$_("[data-ui='choices']").append("<button data-do='" + choice.Do + "' class='" + choice.Class + "'>" + choice.Text + "</button>");
									} else {
										$_("[data-ui='choices']").append("<button data-do='" + choice.Do + "'>" + choice.Text + "</button>");
									}
									globals.block = false;
								}).catch(function () {
									globals.block = false;
								});
							} else {
								if (typeof choice == "object") {
									if (typeof choice.Class != 'undefined') {
										$_("[data-ui='choices']").append("<button data-do='" + choice.Do + "' class='" + choice.Class + "'>" + choice.Text + "</button>");
									} else {
										$_("[data-ui='choices']").append("<button data-do='" + choice.Do + "'>" + choice.Text + "</button>");
									}
								} else if (typeof choice == "string") {
									analyseStatement(choice, false);
								}
							}
							$_("[data-ui='choices']").show ("flex");
						}
					} else if (typeof statement.Conditional != 'undefined') {
						const condition = statement.Conditional;
						Monogatari.assertAsync(condition.Condition).then(function () {
							analyseStatement(condition.True, false);
							globals.block = false;
						}).catch(function () {
							analyseStatement(condition.False, false);
							globals.block = false;
						});

					} else if (typeof statement.Input != 'undefined') {
						$_("[data-ui='input'] [data-ui='input-message']").text(statement.Input.Text);
						$_("[data-ui='input']").addClass("active");

						function inputButtonListener (event) {
							event.stopPropagation ();
							event.preventDefault ();
							const inputValue = $_("[data-ui='input'] input").value();

							Monogatari.assertAsync(statement.Input.Validation, [inputValue]).then(function () {
								Monogatari.assertAsync(statement.Input.Save, [inputValue]).then(function () {
									$_("[data-ui='input']").removeClass("active");
									$_("[data-ui='input'] [data-ui='warning']").text('');
									$_("[data-ui='input'] input").value('');
									$_("[data-ui='input'] [data-action='submit']").get(0).removeEventListener("click", inputButtonListener);
									next ();
									globals.block = false;
								}).catch(function () {
									$_("[data-ui='input']").removeClass("active");
									$_("[data-ui='input'] [data-ui='warning']").text('');
									$_("[data-ui='input'] input").value('');
									$_("[data-ui='input'] [data-action='submit']").get(0).removeEventListener("click", inputButtonListener);
									globals.block = false;
								});
							}).catch(function () {
								$_("[data-ui='input'] [data-ui='warning']").text(statement.Input.Warning);
								globals.block = false;
							});
						}

						$_("[data-ui='input'] [data-action='submit']").click(inputButtonListener);
					} else if (typeof statement.Function !== 'undefined') {
						Monogatari.assertAsync(statement.Function.Apply).then(function () {
							globals.block = false;
							if (advance) {
								next ();
							}
						}).catch(function () {
							globals.block = false;
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