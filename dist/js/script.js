/* global monogatari */

// Define the messages used in the game.
monogatari.action ('Message', {
	messages: {
		'Help': {
			'Title': 'Help',
			'Subtitle': 'Some useful Links',
			'Message': `
				<p><a href='https://monogatari.io/documentation/'>Documentation</a> - Everything you need to know.</p>
				<p><a href='https://monogatari.io/demo/'>Demo</a> - A simple Demo.</p>
			`
		}
	}
});

// Define the notifications used in the game
monogatari.action ('Notify', {
	notifications: {
		'Welcome': {
			title: 'Welcome',
			body: 'This is the Monogatari VN Engine',
			icon: ''
		}
	}
});

// Define the Particles JS Configurations used in the game
monogatari.action ('Particles', {
	particles: {

	}
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
	'h': {
		'Name': 'Hikaru',
		'Color': '#5bcaff'
	}
});

monogatari.script ({
	// The game starts here.
	'Start': [
		'notify Welcome',
		{
			'Input': {
				'Text': 'What is your name?',
				'Validation': function (input) {
					return input.trim().length > 0;
				},
				'Save': function (input) {
					this.storage ({
						player: {
							Name: input
						}
					});
					return true;
				},
				'Warning': 'You must enter a name!'
			}
		},

		'h Hi {{player.Name}} Welcome to Monogatari!',

		{
			'Choice': {
				'Dialog': 'h Have you already read some documentation?',
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

		'h Thats awesome!',
		'h Then you are ready to go ahead and create an amazing Game!',
		'h I can’t wait to see what story you’ll tell!',
		'end'
	],

	'No': [

		'h You can do it now.',

		'display message Help',

		'h Go ahead and create an amazing Game!',
		'h I can’t wait to see what story you’ll tell!',
		'end'
	]
});