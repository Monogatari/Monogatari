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
		cy.get ('[data-sprite="happy"]').should ('not.be.visible');
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

	it ('Engages the end-animation once the main one is over.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y normal at center with fadeIn end-fadeOut',
				'y Tada!',
				'hide character y with left',
				'wait 5000',
				//'show character y happy with rollInLeft',
			]
		});

		cy.start ();

		cy.get ('[data-sprite="happy"]').should ('not.be.visible');
	});
});