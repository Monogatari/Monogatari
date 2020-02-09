context ('Hide Character', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Removes the character', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy with fadeIn',
				'y Hi!',
				'hide character y with fadeOut',
				'y Goodbye!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
		cy.get ('[data-sprite="happy"]').should('have.class', 'fadeIn');

		cy.proceed ();
		cy.get ('[data-sprite="happy"]').should ('not.exist');
	});

	it ('Shows an error if the character was not being shown.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'hide character y with fadeOut',
				'y Goodbye!'
			]
		});

		cy.start ();
		cy.get ('.fancy-error').should ('be.visible');
	});
});