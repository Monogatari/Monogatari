/* global monogatari */

// Define the messages used in the game.
// monogatari.action ('Message').messages ({
// 	'Help': {
// 		title: 'Help',
// 		subtitle: 'Some useful Links',
// 		body: `
// 			<p><a href='https://monogatari.io/documentation/'>Documentation</a> - Everything you need to know.</p>
// 			<p><a href='https://monogatari.io/demo/'>Demo</a> - A simple Demo.</p>
// 		`
// 	}
// });

// Define the notifications used in the game
monogatari.action ('Notification').notifications ({
	'Welcome': {
		title: 'Welcome',
		body: 'This is the Monogatari VN Engine',
		icon: ''
	}
});

// Define the Particles JS Configurations used in the game
monogatari.action ('Particles').particles ({

});

// Define the music used in the game.
monogatari.assets ('music', {

});

// Define the voice files used in the game.
monogatari.assets ('voice', {

});

// Define the sounds used in the game.
monogatari.assets ('sound', {

});

// Define the videos used in the game.
monogatari.assets ('video', {

});

// Define the images used in the game.
monogatari.assets ('images', {

});

// Define the backgrounds for each scene.
monogatari.assets ('scenes', {

});

// Define the Characters
monogatari.characters ({
	'y': {
		name: 'Yui',
		color: '#5bcaff',
		directory: 'Yui',
		sprites: {
			'normal': 'normal.png',
			'happy': 'happy.png'
		}
	}
});

monogatari.script ({
	// The game starts here.
	'Start': [
		'show scene #f7f6f6 with fadeIn',
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
		'show character y happy with fadeIn',
		'y Hi {{player.name}} Welcome to Monogatari!',
		'show character y normal',
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