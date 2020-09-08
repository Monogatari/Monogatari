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
});