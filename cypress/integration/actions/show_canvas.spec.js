context ('Show Canvas', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays provided layers correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show canvas stars background with fadeIn',
				'y Tada!'
			]
		});

		cy.start ();
        cy.get ('[data-layer="sky"]').should ('be.visible');
        cy.get ('[data-layer="stars"]').should ('be.visible');
		cy.get ('[canvas="stars"]').should('have.class', 'fadeIn');
	});

});
