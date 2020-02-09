context ('Next', function () {

	beforeEach (() => {
		cy.open ();
	});

	it ('Continues to the next statement automatically', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'next',
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
	});

	it ('Reverts to the next statement automatically', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'next',
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.get ('text-box').contains ('Before');
	});

});