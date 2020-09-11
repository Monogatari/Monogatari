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

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', null);
		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('timer-display').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('not.equal', null);

		cy.get ('[data-content="field"]').type ('My Name');

		cy.get ('[type="submit"]').click ();

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', null);
		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('timer-display').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('not.equal', null);

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', null);
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
								console.log ('DONE');
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

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', null);
		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('timer-display').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('not.equal', null);

		cy.wait (6000);

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', null);
		cy.get ('text-box').contains ('My Name');

		cy.rollback ();

		cy.get ('text-input').should ('exist');
		cy.get ('[data-content="message"]').contains ('Input');
		cy.get ('[data-content="field"]').should ('be.visible');
		cy.get ('timer-display').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('not.equal', null);

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('global', '_InputTimer').should ('equal', null);
		cy.get ('text-box').contains ('One');

	});
});