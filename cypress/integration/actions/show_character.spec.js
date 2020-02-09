context ('Show Character', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays the character correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy with fadeIn',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
		cy.get ('[data-sprite="happy"]').should('have.class', 'fadeIn');
	});

	it ('Displays the character in the right position', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy at center',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
	});
});