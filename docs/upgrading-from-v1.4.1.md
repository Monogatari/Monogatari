---
title: Upgrading from v1.4.1
order: 6
description: Learn all you need to know about upgrading your game!
---


# Upgrading from v1.4.1

Monogatari has been completely rewritten and many things have changed, however, the script syntax and overall functionality has stayed almost the same so porting your game from v1.4.1 to the newest version is not that complicated!

## 1. Moving your files

Lets start with the easiest task, the best way to port your game is starting fresh and that means downloading the newest version available and move your files there, step by step instead of trying to update your old project.

### Assets

Lets start with the assets, they are now saved on a directory called assets. Here is an equivalence of where you used to store your assets before and where you should store them now:

| Asset | Old Directory | New Directory |
| :--- | :--- | :--- |
| Music | `audio/music/` | `assets/music/` |
| Voice | `audio/voice/` | `assets/voices/` |
| Sounds | `audio/sound/` | `assets/sounds/` |
| Characters | `img/characters` | `assets/characters/` |
| Backgrounds / Scenes | `img/scenes/` | `assets/scenes/` |
| UI Assets | `img/ui/` | `assets/ui/` |
| Video | `video` | `assets/videos/` |

Why did this changed you may ask. Well, by creating an universal assets directory, it is easier to both keep your assets out of version control systems \(git and others\) and also, it allows you to host your assets remotely in an easier way. More info on this will be made available later on.

## 2. Storage

Your players most likely have lots of save files and we want them to keep them even though we're updating the engine. By default, the new version handles storage in a different way which will result on the save files not showing up. To allow your players to keep their save files, we need to change this.

1. Go over to the `options.js` file
2. Find the `Storage` configuration almost at the bottom of the file
3. Edit the `Adapter` property and set it to an empty string \(`''`\)
4. Edit the `Store` property and set it to an empty string \(`''`\)

### Copy your storage object

Now its time to copy your storage object. The `js/storage.js` file is still the place where you'll put all the items you want to save on your game, the syntax has changed just a bit.

**Storage on v1.4.1**


**storage.js**

```javascript
let storage = {
    player: {
        name: ""
    }
};
```


**Storage on v2.0.0**


**storage.js**

```javascript
monogatari.storage ({
    player: {
        name: ''
    }
});
```


As you can see, it really is just a matter of changing the `let storage = { ...storage };` format to the new `monogatari.storage ({ ...storage });` format, you can copy your storage object exactly as it is!

### Update the syntax to set / get values from the storage

Previously, when you wanted to modify the storage, you would modify the variable directly like this:


**script.js**

```javascript
storage.someVariable = someValue;
```


Modifying the storage like that is no longer possible since it has been moved to a function. While you can look at all the new syntax on the [storage documentation](building-blocks/data-storage.md), the easiest way to update the syntax is by replacing all occurrences of it you have on your script for something like this:

```javascript
monogatari.storage ().someVariable = someValue;
```

## 3. Assets Declarations

Just like with the storage, assets declaration syntax has changed just a bit, here's a small comparative on how the assets declaration looks like on your `script.js` file on both the old and the new version.

**Assets declaration on v1.4.1**


**script.js**

```javascript
// Define the Particles JS Configurations used in the game
let particles = {

};

// Define the music used in the game.
const music = {

};

// Define the voice files used in the game.
const voice = {

};

// Define the sounds used in the game.
const sound = {

};

// Define the videos used in the game.
const videos = {

};

// Define the images used in the game.
const images = {

};

// Define the backgrounds for each scene.
const scenes = {

};
```


**Assets declaration on v2.0.0**


**script.js**

```javascript
// Define the Particles JS Configurations used in the game
monogatari.action ('particles').particles ({

});

// Define the music used in the game.
monogatari.assets ('music', {

});

// Define the voice files used in the game.
monogatari.assets ('voices', {

});

// Define the sounds used in the game.
monogatari.assets ('sounds', {

});

// Define the videos used in the game.
monogatari.assets ('videos', {

});

// Define the images used in the game.
monogatari.assets ('images', {

});

// Define the backgrounds for each scene.
monogatari.assets ('scenes', {

});
```


## 4. Script and Labels Declarations

Just as with the storage and assets, the way to declare the script for your game has changed its syntax, here's a comparison on the old and new way:

**Script declaration on v1.4.1**

```javascript
let script = {
    // The game starts here.
    "Start": [
        "notify Welcome",
        {
            "Input": {
                "Text": "What is your name?",
                "Validation": function (input) {
                    return input.trim().length > 0;
                },
                "Save": function (input) {
                    storage.player.Name = input;
                    return true;
                },
                "Warning": "You must enter a name!"
            }
        },

        "h Hi {{player.Name}} Welcome to Monogatari!",

        {
            "Choice": {
                "Dialog": "h Have you already read some documentation?",
                "Yes": {
                    "Text": "Yes",
                    "Do": "jump Yes"
                },
                "No": {
                    "Text": "No",
                    "Do": "jump No"
                }
            }
        }
    ],

    "Yes": [

        "h That's awesome!",
        "h Then you are ready to go ahead and create an amazing Game!",
        "h I can't wait to see what story you'll tell!",
        "end"
    ],

    "No": [

        "h You can do it now.",

        "display message Help",

        "h Go ahead and create an amazing Game!",
        "h I can't wait to see what story you'll tell!",
        "end"
    ]
};
```

**Script declaration on v2.0.0**

```javascript
monogatari.script ({
    // The game starts here.
    'Start': [
        'show notification Welcome',
        {
            'Input': {
                'Text': 'What is your name?',
                'Validation': function (input) {
                    return input.trim ().length > 0;
                },
                'Save': function (input) {
                    this.storage ({
                        player: {
                            name: input
                        }
                    });
                    return true;
                },
                'Revert': function () {
                    this.storage ({
                        player: {
                            name: ''
                        }
                    });
                },
                'Warning': 'You must enter a name!'
            }
        },
        'y Hi {{player.name}} Welcome to Monogatari!',
        {
            'Choice': {
                'Dialog': 'y Have you already read some documentation?',
                'Yes': {
                    'Text': 'Yes',
                    'Do': 'jump Yes'
                },
                'No': {
                    'Text': 'No',
                    'Do': 'jump No'
                }
            }
        }
    ],

    'Yes': [
        'y Thats awesome!',
        'y Then you are ready to go ahead and create an amazing Game!',
        'y I can’t wait to see what story you’ll tell!',
        'end'
    ],

    'No': [

        'y You can do it now.',

        'show message Help',

        'y Go ahead and create an amazing Game!',
        'y I can’t wait to see what story you’ll tell!',
        'end'
    ]
});
```

### Independent Labels

Declaring independent labels for your script is possible as always, and really useful to split your game into multiple files, here's a comparison on how this was achieved on the past and how it's done now.

**Individual Labels on v1.4.1**



**Singe Language**

```javascript
script["myLabel"]["English"] = [
    "some statement",
    "other statement"
];
```



**Multi Language**

```javascript
script["myLabel"] = [
    "some statement",
    "other statement"
];
```



Individual Labels on v2.0.0



**Single Language**

```javascript
monogatari.label ('myLabel', [
    "some statement",
    "other statement"
]);
```



**Multi Language**

```javascript
monogatari.label ('myLabel', 'English', [
    "some statement",
    "other statement"
]);
```



## 5. Script Actions / Statements

The syntax for some of the actions you can perform on your script has been changed. Here's a small list of the ones that changed, however, it is best if you check their individual page to see all the new features!

| Action | Old Syntax | New Syntax |
| :--- | :--- | :--- |
| [Show a character sprite](script-actions/characters.md) | `show <character_id> <sprite_id>` | `show character <character_id> <sprite_id>` |
| [Hide a character sprite](script-actions/hide-character.md) | `hide <character_id>` | `hide character <character_id>` |
| [Show an image](script-actions/show-image.md) | `show <image_id>` | `show image <image_id>` |
| [Hide an image](script-actions/hide-image.md) | `hide <image_id>` | `hide image <image_id>` |
| [Show a message](script-actions/message.md) | `display message <message_id>` | `show message <message_id>` |
| [Show a scene / background image](script-actions/show-scene.md) | `scene <scene_id>` | `show scene <scene_id>` |
| [Show a notification](script-actions/notifications.md) | `notify <notification_id>` | `show notification <notification_id>` |
| [Show a particle system](script-actions/particles.md) | `particles <particles_id>` | `show particles <particles_id>` |
| [Hide a particle system](script-actions/hide-particles.md) | `stop particles` | `hide particles` |

## 6. String Translations

Previously, a file called strings.js was distributed with Monogatari where you would put all your string translations, mainly used for the UI. Now, those translations are handled internally but you can still add strings to them or modify them. Here's some comparison on how it worked before and how it works now.

**Strings declaration on v1.4.1**

```javascript
const strings = {

    "Español": {
        "AdvanceHelp": "Para avanzar en el juego, presiona espacio o haz click.",
        "Audio": "Audio"
    }
};
```

**Strings addition on v1.4.1**

```javascript
strings["Español"]["AllowPlaybac"] = "Click here to allow audio playback";
```

**Strings declaration and addition on v2.0.0**

```javascript
monogatari.translation ('Español', {
    'AdvanceHelp': 'Para avanzar en el juego, presiona espacio o haz click',
    'AllowPlayback': 'Click here to allow audio playback'
});
```
