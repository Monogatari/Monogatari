context ('Save Screen', function () {

	beforeEach (() => {
		cy.open ();
	});

	it ('Gets open when clicking the save button on the quick menu', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'After',
				'end'
			]
		});

		cy.start ();
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();

		cy.get ('[data-component="save-screen"]').should ('be.visible');
	});

	it ('Displays the no saved games message if it\'s empty', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'After',
				'end'
			]
		});

		cy.start ();
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();

		cy.get ('[data-component="save-screen"] p').contains ('No saved games');
	});

	it ('Creates a new slot when the save button is pressed', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'After',
				'end'
			]
		});

		cy.start ();
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();

		cy.get ('[data-action="save"]').click ();

		cy.get ('[data-component="save-screen"] [data-component="save-slot"]').should ('have.length', 1);
	});

	it ('Allows setting a custom name for the save file', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'After',
				'end'
			]
		});

		cy.start ();
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();

		cy.get ('[data-component="save-screen"] input').clear ();
		cy.get ('[data-component="save-screen"] input').type ('Custom Name');

		cy.get ('[data-action="save"]').click ();

		cy.get ('[data-component="save-screen"] [data-component="save-slot"]').should ('have.length', 1);
		cy.get ('[data-component="save-screen"] [data-component="save-slot"] .badge').contains ('Custom Name');
	});

	it ('Allows overwriting an existing file', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'After',
				'end'
			]
		});

		cy.start ();
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();

		cy.get ('[data-component="save-screen"] input').clear ();
		cy.get ('[data-component="save-screen"] input').type ('Custom Name');

		cy.get ('[data-action="save"]').click ();

		cy.get ('[data-component="save-screen"] [data-component="save-slot"]').should ('have.length', 1);
		cy.get ('[data-component="save-screen"] [data-component="save-slot"] .badge').contains ('Custom Name');

		cy.get ('[data-component="save-screen"] [data-component="save-slot"]').click ();

		cy.get ('[data-component="alert-modal"]').should ('be.visible');

		cy.get ('[data-component="alert-modal"] input').clear().type('Overwrite');

		cy.get ('[data-component="alert-modal"] button[data-action="overwrite-slot"]').click ();

		cy.get ('[data-component="alert-modal"]').should ('not.exist');

		cy.get ('[data-component="save-screen"] [data-component="save-slot"] .badge').contains ('Overwrite');

	});

	it ('Removes the slot after it gets deleted', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'After',
				'end'
			]
		});

		cy.start ();
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();

		cy.get ('[data-component="save-screen"] input').clear ();
		cy.get ('[data-component="save-screen"] input').type ('Custom Name');

		cy.get ('[data-action="save"]').click ();

		cy.get ('[data-component="save-screen"] [data-component="save-slot"]').should ('have.length', 1);
		cy.get ('[data-component="save-screen"] [data-component="save-slot"] .badge').contains ('Custom Name');

		cy.get ('[data-component="save-screen"] [data-component="save-slot"] [data-delete]').click();

		cy.get ('[data-component="alert-modal"]').should ('be.visible');

		cy.get ('[data-component="alert-modal"] button[data-action="delete-slot"]').click ();

		cy.get ('[data-component="save-screen"] p').contains ('No saved games');
	});
});