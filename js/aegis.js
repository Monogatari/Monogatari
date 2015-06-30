/**
 * ==============================
 * Aegis Framework | MIT License
 * http://www.aegisframework.com/
 * ==============================
 */

var $_={

	text:{

		capitalize: function(string){
			return string.charAt(0).toUpperCase() + string.slice(1);
		},

		getSuffix: function(string,key){
			var suffix = "";
			var position = string.indexOf(key);
			if(position != -1){
				position += key.length;
				suffix = string.substr(position, string.length - position);
			}
			return suffix;
		},

		getPrefix: function(string,key){
			var prefix = "";
			var position = string.indexOf(key);
			if(position != -1){
				prefix = string.substr(0, position);
			}
			return prefix;
		},

		getAffixes: function(string,key){
    		 var affixes={prefix: this.getPrefix(string,key), suffix: this.getSuffix(string,key)};
    		 return affixes;
		},

		getSelected: function(){
    		return window.getSelection();
		}

	},

	speech:{

		talk: function(string,lang){

			if ('speechSynthesis' in window) {
				if(this.getLocalData("speak")=="true"){
					var msg = new SpeechSynthesisUtterance();
					msg.text = speak;
					msg.lang = lang;
					speechSynthesis.speak(msg);
				}

			}else{
    			return false;
			}
		},

		listen: function(){

		}
	},

	storage:{

		get: function(key){
			if(window.localStorage){
				return localStorage.getItem(key);
			}
		},

		set: function(key,value){
			if(window.localStorage){
				localStorage.setItem(key,value);
			}
		},

		clear: function(){
    		localStorage.clear();
		}

    },

    notification:{

        requestPermission: function(){
            var Notification = window.Notification || window.mozNotification || window.webkitNotification;
            Notification.requestPermission(function (permission) {

            });
        },

        show: function(title,body,icon,click,error,showing,close){

            var notification = new Notification(title, {body: body, icon: icon});

            notification.onclick = click();
            notification.onerror = error();
			notification.onshow = showing();
			notification.onclose = close();
		}

	},

	screen:{

    	isRetina: function(){
        	 if(window.devicePixelRatio >= 2) {
        	    return true;
        	 }else{
            	 return false;
        	 }
    	},

    	isPortrait: function(){
        	 return window.innerHeight > window.innerWidth;
    	},

    	isLandscape: function(){
        	 return (window.orientation === 90 || window.orientation === -90);
    	},

    	getOrientation: function(){
        	if(this.isPortrait){
            	return "portrait";
        	}else if(this.isLandscape){
            	return "landscape";
        	}
    	},

    	getMaxiumWidth: function(){
        	return window.screen.availWidth;
    	},

    	getMaxiumHeight: function(){
        	return window.screen.availHeight;
    	}
	},

	url:{
		getUrl: function(){
			return document.URL;
		},

		getRoute: function(){
			return location.pathname.split("/");
		},

		getId: function(){
			return location.hash;
		},

		getDomain: function(){
			return location.hostname;
		},

		getValues: function(){
			return location.search;
		}
	},

	browser:{
		getLanguage: function(){
			return navigator.language;
		},

		getEngine: function(){
			return navigator.product;
		},

		isOnline: function(){
			return navigator.onLine;
		}

	},

	cursor:{
		wait: function(){
			document.body.className += 'wait';
		},

		normal: function(){

		}
	}
}
