/**
 * ====================================
 * I N D E X
 * ====================================
 * 1) Initialize Variables - 21
 * 2) Plugin Function Calls - 32
 * 3) Set Initial Settings - 43
 * 4) Set iOS Conditions - 105
 * 5) Set Save and Load Slots - 115
 * 6) Save and Load Events - 158
 * 7) Settings Event Handlers - 240
 * 8) Data-Action Event Handlers - 288
 * 9) In-Game Event Handlers - 382
 * 10) Engine Helper Functions - 468
 * 11) Statements Functioning - 705
 * ====================================
**/

/**
 * ======================
 * Initialize Variables
 * ======================
**/

var label, game;
var playing = false;

$(document).ready(function(){

	/**
	 * ======================
	 * Plugin Function Calls
	 * ======================
	**/

	$('a[href*=#]').niceScroll();
	$('a.mailto').mailto();
  $(".lazy").lazyload();
  $('.video-wrapper').fitVids();

	/**
	 * ======================
	 * Set Initial Settings
	 * ======================
	**/

  var local_settings = $_.storage.get("Settings");

	if(local_settings == null || local_settings == ""){
		$_.storage.set("Settings", JSON.stringify(settings));
	}else{
		settings = JSON.parse(local_settings);
	}
	if(!window.localStorage){
		$("[data-ui='slots']").html("<p>Local Storage is not Available in this Browser</p>");
	}

	if(engine["MultiLanguage"]){
		game = script[settings["Language"]];
		$("[data-action='set-language']").val(settings["Language"]);
		$("[data-string]").each(function(){
			var string_translation = strings[$("[data-action='set-language']").val()][$(this).data("string")];
			if(string_translation != null && string_translation != ""){
				$(this).text(string_translation);
			}
		});
	}else{
		game = script;
		$("[data-settings='language']").hide();
	}

	label = game[engine["Label"]];
	document.querySelector("[data-component='music']").volume = settings["Volume"]["Music"];
	document.querySelector("[data-component='ambient']").volume = settings["Volume"]["Music"];
	document.querySelector("[data-component='voice']").volume = settings["Volume"]["Voice"];
	document.querySelector("[data-component='sound']").volume = settings["Volume"]["Sound"];
	document.querySelector("[data-target='music']").value = settings["Volume"]["Music"];
	document.querySelector("[data-target='voice']").value = settings["Volume"]["Voice"];
	document.querySelector("[data-target='sound']").value = settings["Volume"]["Sound"];

	$('[data-background]').each(function(){
		if($(this).data("background").indexOf(".") >- 1){
			var src = "url('" + $(this).data("background") + "') center / cover no-repeat";
			$(this).css("background", src);
		}else{
			$(this).css("background", $(this).data("background"));
		}
	});

	playAmbient();

	// Set Electron's quit handler.
	try{
		window.onbeforeunload = function() {
			if(confirm(strings[settings["Language"]]["Confirm"])){
				window.close();
			}
		}
	}catch(e){

	}

	/**
	 * ======================
	 * Set iOS Conditions
	 * ======================
	**/

	if(/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		$("[data-settings='audio']").html("<p>Audio settings are not supported on iOS</p>");
	}

	/**
	 * =======================
	 * Set Save and Load Slots
	 * =======================
	**/

	function setSlots(){
		if(!window.localStorage){
			return false;
		}
		for(var i = 1; i <= engine["Slots"]; i++){

			var slot = $_.storage.get(engine["SaveLabel"] + i);
			if(slot == null){
				$_.storage.set(engine["SaveLabel"]+i,"");
			}else if(slot != ""){
				var data = JSON.parse(slot);

				if(scenes[data["Engine"]["Scene"]] != null){

					$("[data-menu='load'] [data-ui='slots']").append("<figure data-load-part='" + data["Label"] + "' data-load-element='" + data["Engine"]["Step"] + "' data-load-slot='" + i + "' class='animated flipInX'><img src='img/scenes/" + scenes[data["Engine"]["Scene"]] + "' alt=''><figcaption>" + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");

					$("[data-menu='save'] [data-ui='slots']").append("<figure data-save='" + i + "'><img src='img/scenes/" + scenes[data["Engine"]["Scene"]] + "' alt=''><figcaption>Overwrite " + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");

				}else{
					$("[data-menu='load'] [data-ui='slots']").append("<figure data-load-part='" + data["Label"] + "' data-load-element='" + data["Engine"]["Step"]+ "' data-load-slot='" + i + "' class='animated flipInX'><figcaption>" + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");

					$("[data-menu='save'] [data-ui='slots']").append("<figure data-save='" + i + "'><figcaption>Overwrite " + data["Date"] + " in " + data["Label"] + "</figcaption></figure>");
				}

			}else{
				$("[data-menu='save'] [data-ui='slots']").append("<figure data-save='" + i + "'><figcaption>Save in slot " + i + "</figcaption></figure>");
			}
		}

		// Check if there are no Saved games.
		if($("[data-menu='load'] [data-ui='slots']").html().trim() == ""){
			$("[data-menu='load'] [data-ui='slots']").html("<p>No saved games.</p>");
		}
	}

	setSlots();

	/**
	 * =======================
	 * Save and Load Events
	 * =======================
	**/

	$("[data-menu='load']").on("click","[data-load-part]", function(){
		$("*").wait();
		playing = true;
		$("section").hide();
		$("#game").show();
		$("[data-character]").remove();
		var data = JSON.parse($_.storage.get(engine["SaveLabel"] + $(this).data("load-slot")));
		engine = data["Engine"];

		label = game[data["Label"]];

		for(var j in engine["JS"].split("::")){
			eval(engine["JS"].split("::")[j]);

		}

		for(var i in data["Show"].split(",")){
			if(data["Show"].split(",")[i].trim() != ""){
				$("#game").append(data["Show"].split(",")[i]);
			}
		}

		$('#game').fadeOut('fast', function () {

			if(scenes[data["Engine"]["Scene"]] != null){
				$('#game').css("background","url(img/scenes/" + scenes[data["Engine"]["Scene"]] + ") center / cover no-repeat");
			}else{
				$('#game').css("background",data["Engine"]["Scene"]);
			}

			$('#game').fadeIn('fast');
    	});

    	if(engine["Song"] != ""){
	    	analyseStatement(engine["Song"]);
	    	engine["Step"] -= 1;
    	}

		if(engine["Sound"] != ""){
	    	analyseStatement(engine["Sound"]);
	    	engine["Step"] -= 1;
    	}

		if(engine["Step"] > 0){
			engine["Step"] -= 1;
		}

		$("#game").show();
		analyseStatement(label[engine["Step"]]);
		engine["Step"] += 1;
		$("*").wait();

	});


	$("[data-menu='save']").on("click","[data-save]", function(){
		if(playing){
			$("*").wait();
			var date = new Date();
		    var day = date.getDate();
		    var month = date.getMonth();
		    var year = date.getFullYear();
		    var show = "";

		    $("#game img").each(function(index,value){
			    show += this.outerHTML.replace(/"/g, "'")+",";
		    });

		     $_.storage.set(engine["SaveLabel"] + $(this).data("save"), '{"Date":"' + day + "-"+month + "-" + year + '","Engine":' + JSON.stringify(engine) + ',"Show":"' + show + '","Label":"' + engine["Label"] + '"}');
			$("[data-menu='load'] [data-ui='slots']").html("");
			$("[data-menu='save'] [data-ui='slots']").html("");
			setSlots();
			$("*").wait();
		}
	});

	/**
	 * =======================
	 * Settings Event Handlers
	 * =======================
	**/

	$("[data-action='set-volume']").on("change mouseover", function(){
		var v = document.querySelector("[data-component='" + $(this).data("target") + "']");
		var value = $(this).val();

		switch($(this).data("target")){
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
		$_.storage.set("Settings", JSON.stringify(settings));
	});

	$("[data-action='set-language']").change(function(){
		settings["Language"] = $(this).val();
		game = script[settings["Language"]];
		label = game[engine["Label"]];
		$_.storage.set("Settings",JSON.stringify(settings));

		$("[data-string]").each(function(){
			$(this).text(strings[$("[data-action='set-language']").val()][$(this).data("string")]);
		});
	});

	$("[data-select]").click(function(){
		var e = document.createEvent('MouseEvents');
	    e.initMouseEvent('mousedown');
	    $("[data-action='" + $(this).data("select") + "']")[0].dispatchEvent(e);
	});

	/**
	 * ==========================
	 * Data-Action Event Handlers
	 * ==========================
	**/

	$("[data-action]").click(function(){

	    switch($(this).data("action")){

			case "open-menu":
				$("section").hide();
				$("[data-menu='" + $(this).data("open") + "']").show();
				break;

			case "pause":
				break;

			case "start":
				stopAmbient();
				playing = true;
				$("section").hide();
				$("#game").show();
				analyseStatement(label[engine["Step"]]);
				engine["Step"]+=1;
				break;

			case "close":
				$("[data-ui='" + $(this).data("close") + "']").removeClass("active");
				break;

			case "close-video":
				var video_player = document.querySelector("[data-ui='player']");
				video_player.pause();
				video_player.currentTime = 0;
				video_player.setAttribute("src", "");
				$('[data-component="video"]').removeClass("active");
				break;

			case "end":
				if(confirm(strings[settings["Language"]]["Confirm"])){
					endGame();
					playAmbient();
				}
				break;

			case "distraction-free":
				if($(this).hasClass("fa-eye")){
					$(this).removeClass("fa-eye");
					$(this).addClass("fa-eye-slash");
					$("[data-ui='text']").hide();
				}else if($(this).hasClass("fa-eye-slash")){
					$(this).removeClass("fa-eye-slash");
					$(this).addClass("fa-eye")
					$("[data-ui='text']").show();
				}
				break;

			case "jump":
				stopAmbient();
				label = game[$(this).data("jump")];
				engine["Step"] = 0;
				playing = true;
				$("section").hide();
				$("#game").show();
				analyseStatement(label[engine["Step"]]);
				engine["Step"] += 1;
				break;
	    }

    });

    $("#game [data-action='back']").click(function(){
	    if(!$("[data-ui='choices']").is(":visible")
	    	&& !$("[data-component='modal']").is(":visible")
	    	&& !$("[data-component='video']").is(":visible")
	    	&& $("#game").is(":visible")
	    	&& !$("#planner").prop("open")
	    	&& ($("[data-ui='text']").is(":visible")
			|| (!$("[data-ui='text']").is(":visible") && $("[data-ui='centered']").is(":visible")) )){

		    previous();
		}
	});

	$("[data-action='back']:not(#game)").click(function(){
		$("section").hide();
		if(playing){
			$("#game").show();
		}else{
			$("[data-menu='main']").show();
		}
	});

    /**
	 * ==========================
	 * In-Game Event Handlers
	 * ==========================
	**/

	$(document).keyup(function(e) {
		switch(e.which) {
			case 27: // escape
				$("#game").hide();
				$("[data-menu='settings']").show();
				break;

			case 32: // spacebar
				if(!$("[data-ui='choices']").is(":visible")
					&& !$("[data-component='modal']").is(":visible")
					&& !$("[data-component='video']").is(":visible")
					&& $("#game").is(":visible")
					&& !$("#planner").prop("open")
					&& ($("[data-ui='text']").is(":visible")
					|| (!$("[data-ui='text']").is(":visible") && $("[data-ui='centered']").is(":visible")) )){

					hideCentered();
					shutUp();
					analyseStatement(label[engine["Step"]]);
					engine["Step"]+=1;
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

	$("body").on("click","[data-do]", function(){

		hideCentered();
		shutUp();
		if($(this).data("do") != "null" && $(this).data("do") != ""){
			var back = ["show", "play", "display", "hide", "scene", "stop", "pause"];
			try{
				if(back.indexOf($(this).data("do").split(" ")[0]) >- 1){
					engine["Step"] -= 1;
					analyseStatement($(this).data("do"));
					engine["Step"] += 1;
				}else{
					if($(this).data("do").split(" ")[0] == "jump"){
						analyseStatement($(this).data("do"));
						engine["Step"] += 1;
					}else{
						analyseStatement($(this).data("do"));
					}
				}

			}catch(e){
				console.log("An error ocurred while trying to execute the choice's action.\n"+e);
			}
		}
		$("[data-ui='choices']").hide();
		$("[data-ui='choices']").html("");
	});

	$("#game").click(function(){
		if(!$("[data-ui='choices']").is(":visible")
			&& $("#game").is(":visible")
			&& !$("[data-component='modal']").is(":visible")
			&& ($("[data-ui='text']").is(":visible")
			|| (!$("[data-ui='text']").is(":visible") && $("[data-ui='centered']").is(":visible")) )
			&& !$("[data-component='video']").is(":visible")){

			hideCentered();
			shutUp();
			analyseStatement(label[engine["Step"]]);
			engine["Step"]+=1;
	    }

	}).on('click', '[data-ui="quick-menu"] *', function(e) {
	    // Clicked Child
	    e.stopPropagation();
	});

	/**
	 * =======================
	 * Engine Helper Functions
	 * =======================
	**/

	function hideCentered(){
		$("[data-ui='centered']").remove();
		$("[data-ui='text']").show();
	}

	function playAmbient(){
		if(engine["MenuMusic"] != ""){
			var ambient_player = document.querySelector("[data-component='ambient']");
			ambient_player.setAttribute("loop","");

			if(typeof music !== 'undefined'){
				if(music[engine["MenuMusic"]] != null){
					ambient_player.setAttribute("src", "audio/music/" + music[engine["MenuMusic"]]);
				}else{
					ambient_player.setAttribute("src", "audio/music/" + engine["MenuMusic"]);
				}
			}else{
				ambient_player.setAttribute("src", "audio/music/" + engine["MenuMusic"]);
			}

			ambient_player.play();
		}
	}

    function stopAmbient() {
	var a_player = document.querySelector("[data-component='ambient']");
	if (!a_player.paused)
	    a_player.pause();
    }

	function shutUp(){
		var voice_player = document.querySelector("[data-component='voice']");
	    if(!voice_player.paused && voice_player.src!=null && voice_player.src!= ""){
		    voice_player.pause();
			voice_player.currentTime = 0;
	    }
	}

	// Function to end the game.
    function endGame(){
	    for(var i = 0; i < document.getElementsByTagName("audio").length; i++){
		    var v = document.getElementsByTagName("audio");
		    if(!v[i].paused && v[i].src!=null && v[i].src!= ""){
			    v[i].pause();
				v[i].currentTime = 0;
		    }
	    }
	    $("[data-ui='messages']").removeClass("active");
	    $("#game img").hide();
	    playing = false;
		engine["Label"] = "Start";
		label = game[engine["Label"]];
		engine["Step"] = 0;
		$("section").hide();
		$("[data-menu='main']").show();
    }

	// Function to execute the next statement in the script.
	function next(){
		engine["Step"] += 1;
		analyseStatement(label[engine["Step"]]);
	}

	// Function to execute the previous statement in the script.
	function previous(){

		hideCentered();
		shutUp();
		if(engine["Step"] >= 2){
			engine["Step"] -= 2;
			var back = ["show", "play", "display", "hide", "stop"];
			try{
				if(typeof label[engine["Step"]] == "string"){
					while(back.indexOf(label[engine["Step"]].split(" ")[0]) >- 1){
						var parts = label[engine["Step"]].split(" ");
						switch(parts[0]){
							case "show":
								if(characters[parts[1]] != null){
									$("[data-character='" + parts[1] + "']").remove();
									if(engine["CharacterHistory"].length > 1){
										engine["CharacterHistory"].pop()
									}

									var last_character = engine["CharacterHistory"].slice(-1)[0];
									if(last_character != null){
										if(last_character.indexOf("data-character='"+parts[1]+"'") > -1){
											$("#game").append(last_character);
										}
									}

								}else if(images[parts[1]] != null){
									if(parts[3] != null && parts[3] != ""){
										$("[data-image='" + parts[1] + "']").addClass(parts[3]);
									}else{
										$("[data-image='" + parts[1] + "']").remove();
									}
									engine["ImageHistory"].pop();

								}else{
									if(parts[3] != null && parts[3] != ""){
										$("[data-image='" + parts[1] + "']").addClass(parts[3]);
									}else{
										$("[data-image='" + parts[1] + "']").remove();
									}
									engine["ImageHistory"].pop();
								}
								break;

							case "play":
								if(parts[1] == "music"){
									var music_player = document.querySelector("[data-component='music']");
									music_player.removeAttribute("loop");
									music_player.setAttribute("src", "");
									engine["Song"] = "";
									music_player.pause();
									music_player.currentTime = 0;
								}else if(parts[1] == "sound"){
									var sound_player = document.querySelector("[data-component='sound']");
									sound_player.removeAttribute("loop");
									sound_player.setAttribute("src", "");
									sound_player.pause();
									sound_player.currentTime = 0;
								}
								break;

							case "stop":
								if(parts[1] == "music"){
									var last = engine["MusicHistory"].pop().split(" ");
									var music_player = document.querySelector("[data-component='music']");

									if(last[3] == "loop"){
										music_player.setAttribute("loop","");
									}else if(last[3] == "noloop"){
										music_player.removeAttribute("loop");
									}
									if(typeof music !== 'undefined') {
										if(music[last[2]] != null){
											music_player.setAttribute("src", "audio/music/" + music[last[2]]);
										}else{
											music_player.setAttribute("src", "audio/music/" + last[2]);
										}
									}else{
										music_player.setAttribute("src", "audio/music/" + last[2]);
									}
									music_player.play();
									engine["Song"] = last.join(" ");
								}else if(parts[1] == "sound"){
									var last = engine["SoundHistory"].pop().split(" ");
									var sound_player = document.querySelector("[data-component='sound']");

									if(last[3] == "loop"){
										sound_player.setAttribute("loop","");
									}else if(last[3] == "noloop"){
										sound_player.removeAttribute("loop");
									}

									if(typeof sound !== 'undefined') {
										if(sound[last[2]] != null){
											sound_player.setAttribute("src", "audio/sound/" + sound[last[2]]);
										}else{
											sound_player.setAttribute("src", "audio/sound/" + last[2]);
										}
									}else{
										sound_player.setAttribute("src", "audio/sound/" + last[2]);
									}

									sound_player.play();
									engine["Sound"] = last.join(" ");
								}
								break;

							case "scene":

								$("[data-character]").remove();
								$("[data-image]").remove();

								engine["SceneHistory"].pop()
					        	engine["Scene"] =  engine["SceneHistory"].slice(-1)[0];
								$('#game').fadeOut('fast', function () {

									if(scenes[parts[1]] != null){
										$('#game').css("background","url(img/scenes/" + scenes[engine["Scene"]] + ") center / cover no-repeat");
									}else{
										$('#game').css("background",engine["Scene"]);
									}

									$('#game').fadeIn('fast');
					        	});

					        	whipeText();
								break;

							case "display":
								if(parts[1] == "message"){
									var mess = messages[parts[2]];
									$("[data-ui='message-content']").html("");
									$("[data-ui='messages']").removeClass("active");
								}else if(parts[1] == "image"){
									$("[data-image='" + parts[2] + "']").remove();
								}
								break;
							case "hide":
								if(characters[parts[1]] != null){
									$("#game").append(engine["CharacterHistory"].pop());

								}else if(images[parts[1]] != null){
									$("#game").append(engine["ImageHistory"].pop());

								}
								break;
						}
						if((engine["Step"]-1) >= 0){
							engine["Step"] -= 1;
						}
					}

				}else if(typeof label[engine["Step"]] == "object"){
					while(typeof label[engine["Step"]] == "object"){

						if((engine["Step"]-1) >=0){
							engine["Step"] -= 1;
						}
					}
				}
				analyseStatement(label[engine["Step"]]);
				engine["Step"] += 1;
			}catch(e){
				console.log("An error ocurred while trying to exectute the previous statement.\n"+e);
			}
		}
	}

	function whipeText(){
		$("[data-ui='who']").html("");
		$("[data-ui='say']").html("");
	}

	/**
	 * =======================
	 * Statements Functioning
	 * =======================
	**/

    function analyseStatement(statement){
		try{
			switch(typeof statement){
			    case "string":
			    	var parts = statement.split(" ");

					switch(parts[0]){

						case "play":

							if(parts[1] == "music"){
								var music_player = document.querySelector("[data-component='music']");

								if(parts[3] == "loop"){
									music_player.setAttribute("loop","");
								}else if(parts[3] == "noloop"){
									music_player.removeAttribute("loop");
								}

								if(typeof music !== 'undefined'){
									if(music[parts[2]] != null){
										music_player.setAttribute("src", "audio/music/" + music[parts[2]]);
									}else{
										music_player.setAttribute("src", "audio/music/" + parts[2]);
									}
								}else{
									music_player.setAttribute("src", "audio/music/" + parts[2]);
								}

								music_player.play();
								engine["Song"] = parts.join(" ");
								engine["MusicHistory"].push(engine["Song"]);
								next();
							}else if(parts[1] == "sound"){
								var sound_player = document.querySelector("[data-component='sound']");
								if(parts[3] == "loop"){
									sound_player.setAttribute("loop","");
								}else if(parts[3] == "noloop"){
									sound_player.removeAttribute("loop");
								}

								if(typeof sound !== 'undefined'){
									if(sound[parts[2]] != null){
										sound_player.setAttribute("src", "audio/sound/" + sound[parts[2]]);
									}else{
										sound_player.setAttribute("src", "audio/sound/" + parts[2]);
									}
								}else{
									sound_player.setAttribute("src", "audio/sound/" + parts[2]);
								}

								sound_player.play();
								engine["Sound"] = parts.join(" ");
								engine["SoundHistory"].push(engine["Sound"]);
								next();
							}else if(parts[1] == "voice"){
								var voice_player = document.querySelector("[data-component='voice']");

								if(typeof voice !== 'undefined') {
									if(voice[parts[2]] != null){
										voice_player.setAttribute("src", "audio/voice/" + voice[parts[2]]);
									}else{
										voice_player.setAttribute("src", "audio/voice/" + parts[2]);
									}
								}else{
									voice_player.setAttribute("src", "audio/voice/" + parts[2]);
								}

								voice_player.play();
								next();
							}else if(parts[1] == "video"){
								var video_player = document.querySelector("[data-ui='player']");

								if(typeof videos !== 'undefined') {
									if(videos[parts[2]] != null){
										video_player.setAttribute("src", "video/" + videos[parts[2]]);
									}else{
										video_player.setAttribute("src", "video/" + parts[2]);
									}
								}else{
									video_player.setAttribute("src", "video/" + parts[2]);
								}

								$('[data-component="video"]').addClass("active");
								video_player.play();
							}

							break;

						case "scene":
							$("[data-character]").remove();
							$("[data-image]").remove();

							$('#game').fadeOut('fast', function () {

								if(scenes[parts[1]] != null){
									$('#game').css("background","url(img/scenes/" + scenes[parts[1]] + ") center / cover no-repeat");
								}else{
									$('#game').css("background", parts[1]);
								}

								$('#game').fadeIn('fast');
				        	});

				        	engine["Scene"] = parts[1];
				        	engine["SceneHistory"].push(parts[1]);
				        	whipeText();
							next();
							break;

						case "show":
							if(characters[parts[1]] != null){
								var directory = characters[parts[1]]["Directory"];
								if(directory == null){
									directory = "";
								}
								var image = characters[parts[1]]["Images"][parts[2]].split(" ")[0];
								$("[data-character='" + parts[1] + "']").remove();
								if(parts[3] == null){
									parts[3] = "center";
								}
								if(parts[3] == "with"){
									parts[3] = "center";
									parts[5] = parts[4];
								}
								$("#game").append("<img src='img/characters/" + directory + "/" + image + "' class='animated " + parts[5] + " "+parts[3] + "' data-character='" + parts[1] + "'>");
								if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
									if($_.screen.isLandscape()){
										$("img").css("height","80%");
									}else{
										$("img").css("height","60%");
									}
								}
								engine["CharacterHistory"].push("<img src='img/characters/" + directory + "/" + image + "' class='animated " + parts[5] + " " + parts[3] + "' data-character='" + parts[1] + "'>");

							}else if(images[parts[1]] != null){

								if(parts[2] == null){
									parts[2] = "center";
								}

								if(parts[2] == "with"){
									parts[2] = "center";
									parts[4] = parts[3];
								}

								$("#game").append("<img src='img/" + images[parts[1]] + "' class='animated " + parts[4] + " " + parts[2] + "' data-image='" + parts[1] + "'>");
								engine["ImageHistory"].push("<img src='img/" + images[parts[1]] + "' class='animated " + parts[4] + " " + parts[2] + "' data-image='" + parts[1] + "'>");

							}else{
								if(parts[2] == null){
									parts[2] = "center";
								}

								if(parts[2] == "with"){
									parts[2] = "center";
									parts[4] = parts[3];
								}
								$("#game").append("<img src='img/" + parts[1] + "' class='animated " + parts[4] + " " + parts[2] + "' data-image='" + parts[1] + "'>");
								engine["ImageHistory"].push("<img src='img/" + parts[1] + "' class='animated " + parts[4] + " " + parts[2] + "' data-image='" + parts[1] + "'>");
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
							if(parts[1] == "music"){
								var music_player = document.querySelector("[data-component='music']");
								music_player.removeAttribute("loop");
								music_player.setAttribute("src", "");
								engine["Song"] = "";
								music_player.pause();
								music_player.currentTime = 0;
							}else if(parts[1] == "sound"){
								var sound_player = document.querySelector("[data-component='sound']");
								sound_player.removeAttribute("loop");
								sound_player.setAttribute("src", "");
								engine["Sound"] = "";
								sound_player.pause();
								sound_player.currentTime = 0;
							}
							next();
							break;

						case "pause":
							if(parts[1] == "music"){
								var music_player = document.querySelector("[data-component='music']");
								music_player.pause();
							}else if(parts[1] == "sound"){
								var sound_player = document.querySelector("[data-component='sound']");
								sound_player.pause();
							}
							next();
							break;

						case "hide":
							if(characters[parts[1]] != null){
								if(parts[3] != null && parts[3]!=""){
									$("[data-character='" + parts[1] + "']").addClass(parts[3]);
								}else{
									$("[data-character='" + parts[1] + "']").remove();
								}

							}else if(images[parts[1]] != null){
								if(parts[3] != null && parts[3] != ""){
									$("[data-image='" + parts[1] + "']").addClass(parts[3]);
								}else{
									$("[data-image='" + parts[1] + "']").remove();
								}

							}else{
								if(parts[3] != null && parts[3] != ""){
									$("[data-image='" + parts[1] + "']").addClass(parts[3]);
								}else{
									$("[data-image='" + parts[1] + "']").remove();
								}
							}
							next();
							break;

						case "display":

							if(parts[1] == "message"){
								var mess = messages[parts[2]];
								$("[data-ui='message-content']").html("<h3>" + mess["Title"] + "</h3><p>" + mess["Subtitle"] + "</p>" + "<p>" + mess["Message"] + "</p>");
								$("[data-ui='messages']").addClass("active");
							}else if(parts[1] == "image"){
								if(parts[3] == null){
									parts[3] = "center";
								}
								if(parts[3] == "with"){
									parts[3] = "center";
									parts[5] = parts[4];
								}
								if(images[parts[2]] != null){
									$("#game").append("<img src='img/" + images[parts[2]] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
									engine["ImageHistory"].push("<img src='img/" + images[parts[2]] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
								}else{
									$("#game").append("<img src='img/" + parts[2] + "' class='animated " + parts[5] + " " + parts[3] + "' data-image='" + parts[2] + "'>");
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
							$("[data-ui='text']").hide();
							$("#game").append("<div class='middle align-center' data-ui='centered'>"+statement.replace(parts[0] + " ", "")+"</div>");
							break;

						default:

							if(characters[parts[0]] != null){
								document.querySelector("[data-ui='who']").innerHTML = characters[parts[0]]["Name"];
								$("[data-ui='who']").css("color", characters[parts[0]]["Color"]);
								document.querySelector("[data-ui='say']").innerHTML = statement.replace(parts[0] + " ", "");
								if(characters[parts[0]]["Face"] != null && characters[parts[0]]["Face"]  != ""){
									var directory = characters[parts[0]]["Directory"];
									if(directory == null){
										directory = "";
									}
									$("[data-ui='face']").attr("src", "img/characters/" + directory + "/" + characters[parts[0]]["Face"]);
									$("[data-ui='face']").show();
								}else{
									$("[data-ui='face']").hide();
								}
							}else{
								$("[data-ui='face']").hide();
								document.querySelector("[data-ui='who']").innerHTML = "";
								document.querySelector("[data-ui='say']").innerHTML = statement;
							}
							break;
					}
			    	break;

			    case "function":
			    	if(statement()){
				    	next();
			    	}
			    	break;

			    case "object":
			    	if(statement["Choice"] != null){
				    	$("[data-ui='choices']").html("");
				    	for(var i in statement["Choice"]){
					    	var choice = label[engine["Step"]]["Choice"][i];
					    	if(choice["Condition"] != null && choice["Condition"] != ""){

						    	if(eval(label[engine["Step"]]["Choice"][i]["Condition"])){
							    	$("[data-ui='choices']").append("<button data-do='" + choice["Do"] + "'>"+choice["Text"] + "</button>");
						    	}

					    	}else{
						    	$("[data-ui='choices']").append("<button data-do='" + choice["Do"] + "'>" + choice["Text"] + "</button>");
					    	}
							$("[data-ui='choices']").show();
						}
			    	}else if(statement["Conditional"] != null){
				    	var condition = statement["Conditional"];
				    	if(eval(condition["Condition"])){
					    	if(condition["True"].trim() == ""){
								analyseStatement("next");
					    	}else{
						    	analyseStatement(condition["True"]);
					    	}

				    	}else{
					    	analyseStatement(condition["False"]);
				    	}
			    	}
			    	break;
			}
		}catch(e){
			console.log("An error ocurred while while trying to analyse the following statement: " + statement + "\n" + e);
			next();
		}
    }
});
