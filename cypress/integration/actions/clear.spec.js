context ('Clear', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Removes the dialog, character name and side image', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy Hello!',
				'clear',
				'wait 5000'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello!');
		cy.get ('[data-content="character-expression"]').should ('be.visible');

		cy.proceed ();
		cy.get ('[data-content="character-expression"]').should ('not.be.visible');
		cy.get ('[data-content="dialog"]').should ('be.empty');
		cy.get ('[data-content="character-name"]').should ('be.empty');
	});

	it ('Proceeds automatically to the next line', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'clear',
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');

		cy.proceed ();
		cy.get ('text-box').contains ('After');
	});

	it ('Rolls back on adv mode', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'clear',
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');

		cy.proceed ();
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.wait (100);
		cy.get ('text-box').contains ('Before');
	});

	it ('Rolls back on nvl mode', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'nvl Before',
				'clear',
				'nvl After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');

		cy.proceed ();
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.wait (100);
		cy.get ('text-box').contains ('Before');
	});
});