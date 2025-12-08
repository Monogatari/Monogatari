context ('Input', function () {

	beforeEach (() => {
		cy.open ();
	});

	it ('Saves data and rolls back correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{
					'Input': {
						'Text': 'Input',
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
				'After {{player.name}}'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('storage', 'player').should ('deep.equal', { name: '' });
		cy.get ('text-box').contains ('Before');
		cy.proceed ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('[data-content="field"]').type ('My Name');

		cy.get ('[type="submit"]').click ();

		cy.wrap (this.monogatari).invoke ('storage', 'player').should ('deep.equal', { name: 'My Name' });
		cy.get ('text-input').should ('not.exist');

		cy.get ('text-box').contains ('After My Name');

		cy.rollback ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('storage', 'player').should ('deep.equal', { name: '' });

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('storage', 'player').should ('deep.equal', { name: '' });
		cy.get ('text-box').contains ('Before');

	});

	it ('Shows the default value when provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{
					'Input': {
						'Text': 'Input',
						'Default': 'My Name',
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
			]
		});

		cy.start ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('[data-content="field"]').should ('have.value','My Name');
	});

	it ('Shows a warning when the Validation function returns false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{
					'Input': {
						'Text': 'Input',
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
			]
		});

		cy.start ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('[type="submit"]').click ();

		cy.get ('[data-content="warning"]').contains ('You must enter a name!');
	});

	it ('Shows a timer when one is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				{
					'Input': {
						'Text': 'Input',
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
						'Timer': {
							// Time in milliseconds
							time: 5000,
							// The function to run when the time is over
							callback: () => {
								// Get all choices being shown and that are not disabled
								// const choices = window.monogatari.element ().find ('[data-choice]:not([disabled])');

								// // Pick one of those options randomly
								// const random = choices.get (window.monogatari.random (0, choices.length - 1));

								// // Fake a click on it
								// random.click ();

								// Promise friendly!
								return Promise.resolve ();
							}
						},
						'Warning': 'You must enter a name!'
					}
				},
				'Two',
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', undefined);
		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('timer-display').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('not.equal', undefined);

		cy.get ('[data-content="field"]').type ('My Name');

		cy.get ('[type="submit"]').click ();

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', undefined);
		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('timer-display').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('not.equal', undefined);

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', undefined);
		cy.get ('text-box').contains ('One');

	});

	it ('Gets filled automatically when timer is done', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				{
					'Input': {
						'Text': 'Input',
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
						'Timer': {
							// Time in milliseconds
							time: 5000,
							// The function to run when the time is over
							callback: function () {
								// Get all choices being shown and that are not disabled
								const input = this.element ().find ('text-input').get (0);

								input.content ('field').value ('My Name');

								// // Pick one of those options randomly
								const submit = input.element ().find ('button').get (0);

								// // Fake a click on it
								submit.click ();

								// Promise friendly!
								return Promise.resolve ();
							}
						},
						'Warning': 'You must enter a name!'
					}
				},
				'{{player.name}}',
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', undefined);
		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('timer-display').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('not.equal', undefined);

		cy.wait (6000);

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', undefined);
		cy.get ('text-box').contains ('My Name');

		cy.rollback ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('timer-display').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('not.equal', undefined);

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', undefined);
		cy.get ('text-box').contains ('One');

	});

	it ('Renders a select input with options', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{
					'Input': {
						'Text': 'Choose your class',
						'Type': 'select',
						'Options': [
							{ value: 'warrior', label: 'Warrior' },
							{ value: 'mage', label: 'Mage' },
							{ value: 'rogue', label: 'Rogue' }
						],
						'Default': 'mage',
						'Save': function (input) {
							this.storage ({
								player: {
									class: input
								}
							});
							return true;
						},
						'Revert': function () {
							this.storage ({
								player: {
									class: ''
								}
							});
						}
					}
				},
				'You chose {{player.class}}'
			]
		});

		cy.start ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Choose your class');
		cy.get ('select[data-content="field"]').should ('be.visible');
		cy.get ('select[data-content="field"]').should ('have.value', 'mage');
		cy.get ('select[data-content="field"] option').should ('have.length', 3);

		cy.get ('select[data-content="field"]').select ('warrior');
		cy.get ('[type="submit"]').click ();

		cy.wrap (this.monogatari).invoke ('storage', 'player').its ('class').should ('equal', 'warrior');
		cy.get ('text-box').contains ('You chose warrior');
	});

	it ('Renders radio buttons with options', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{
					'Input': {
						'Text': 'Choose difficulty',
						'Type': 'radio',
						'Options': [
							{ value: 'easy', label: 'Easy' },
							{ value: 'normal', label: 'Normal' },
							{ value: 'hard', label: 'Hard' }
						],
						'Default': 'normal',
						'Save': function (input) {
							this.storage ({
								game: {
									difficulty: input
								}
							});
							return true;
						},
						'Revert': function () {
							this.storage ({
								game: {
									difficulty: ''
								}
							});
						}
					}
				},
				'Difficulty: {{game.difficulty}}'
			]
		});

		cy.start ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Choose difficulty');
		cy.get ('input[type="radio"][data-content="field"]').should ('have.length', 3);
		cy.get ('input[type="radio"][value="normal"]').should ('be.checked');

		cy.get ('input[type="radio"][value="hard"]').check ();
		cy.get ('[type="submit"]').click ();

		cy.wrap (this.monogatari).invoke ('storage', 'game').its ('difficulty').should ('equal', 'hard');
		cy.get ('text-box').contains ('Difficulty: hard');
	});

	it ('Renders checkboxes with options and returns array', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{
					'Input': {
						'Text': 'Select your skills',
						'Type': 'checkbox',
						'Options': [
							{ value: 'sword', label: 'Sword Fighting' },
							{ value: 'magic', label: 'Magic' },
							{ value: 'stealth', label: 'Stealth' }
						],
						'Save': function (input) {
							this.storage ({
								player: {
									skills: input
								}
							});
							return true;
						},
						'Revert': function () {
							this.storage ({
								player: {
									skills: []
								}
							});
						}
					}
				},
				'Done'
			]
		});

		cy.start ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Select your skills');
		cy.get ('input[type="checkbox"][data-content="field"]').should ('have.length', 3);

		cy.get ('input[type="checkbox"][value="sword"]').check ();
		cy.get ('input[type="checkbox"][value="magic"]').check ();
		cy.get ('[type="submit"]').click ();

		cy.wrap (this.monogatari).invoke ('storage', 'player').its ('skills').should ('deep.equal', ['sword', 'magic']);
		cy.get ('text-box').contains ('Done');
	});

	it ('Renders a textarea input', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{
					'Input': {
						'Text': 'Write your backstory',
						'Type': 'textarea',
						'Default': 'Once upon a time...',
						'Validation': function (input) {
							return input.trim ().length > 0;
						},
						'Save': function (input) {
							this.storage ({
								player: {
									backstory: input
								}
							});
							return true;
						},
						'Revert': function () {
							this.storage ({
								player: {
									backstory: ''
								}
							});
						},
						'Warning': 'Please write something!'
					}
				},
				'Done'
			]
		});

		cy.start ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Write your backstory');
		cy.get ('textarea[data-content="field"]').should ('be.visible');
		cy.get ('textarea[data-content="field"]').should ('have.value', 'Once upon a time...');

		cy.get ('textarea[data-content="field"]').clear ().type ('A hero was born.');
		cy.get ('[type="submit"]').click ();

		cy.wrap (this.monogatari).invoke ('storage', 'player').its ('backstory').should ('equal', 'A hero was born.');
	});

	it ('Applies custom classes to the input', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{
					'Input': {
						'Text': 'Enter name',
						'Class': 'custom-class another-class',
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
						'Warning': 'Required'
					}
				},
			]
		});

		cy.start ();

		cy.get ('text-input').should ('exist');
		cy.get ('text-input').should ('have.class', 'custom-class');
		cy.get ('text-input').should ('have.class', 'another-class');
	});

	it ('Applies custom attributes to the input field', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{
					'Input': {
						'Text': 'Enter age',
						'Type': 'number',
						'Attributes': {
							'min': 0,
							'max': 120,
							'placeholder': 'Your age'
						},
						'Validation': function (input) {
							return input >= 0 && input <= 120;
						},
						'Save': function (input) {
							this.storage ({
								player: {
									age: parseInt (input, 10)
								}
							});
							return true;
						},
						'Revert': function () {
							this.storage ({
								player: {
									age: 0
								}
							});
						},
						'Warning': 'Enter a valid age'
					}
				},
			]
		});

		cy.start ();

		cy.get ('text-input').should ('exist');
		cy.get ('input[data-content="field"]').should ('have.attr', 'min', '0');
		cy.get ('input[data-content="field"]').should ('have.attr', 'max', '120');
		cy.get ('input[data-content="field"]').should ('have.attr', 'placeholder', 'Your age');
	});

	it ('Displays custom action string on the button', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.translation ('English', {
			'Submit': 'Submit'
		});
		this.monogatari.script ({
			'Start': [
				{
					'Input': {
						'Text': 'Enter name',
						'actionString': 'Submit',
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
						'Warning': 'Required'
					}
				},
			]
		});

		cy.start ();

		cy.get ('text-input').should ('exist');
		cy.get ('text-input button[type="submit"]').contains ('Submit');
	});
});