context ('Wait', function () {

	beforeEach (() => {
		cy.open ();
	});

	it ('Waits for a click if no time is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show scene black',
				'wait',
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box [data-content="dialog"]').should ('be.empty');
		cy.wait (100);
		cy.get ('text-box [data-content="dialog"]').should ('be.empty');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
	});

	it ('Proceeds to the next statement automatically', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show scene black',
				'wait 500',
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box [data-content="dialog"]').should ('be.empty');
		cy.wait (500);
		cy.get ('text-box').contains ('After');
	});

	it ('Reverts to the previous statement automatically', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'wait',
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.get ('text-box').contains ('Before');
		cy.wait (100);
		cy.proceed ();
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.get ('text-box').contains ('Before');
	});

	it ('Reverts to the previous statement automatically', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'wait 500',
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.wait (500);
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.get ('text-box').contains ('Before');
	});

	it ('Shows an error if the time provided is not numeric', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'wait s',
				'After'
			]
		});

		cy.start ();
		cy.get ('.fancy-error').should ('be.visible');
	});

});