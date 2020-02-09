context ('Dialog', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays the character\'s side image correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy Hello!'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello!');
		cy.get ('[data-content="character_expression"]').should ('be.visible');
	});
});