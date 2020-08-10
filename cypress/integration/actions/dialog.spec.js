context ('Dialog', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays the character\'s name and side image correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy Hello!'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello!');
		cy.get ('[data-content="character-expression"]').should ('be.visible');
	});

	it ('Adds the dialog-footer class to the last dialog of an nvl character when the character speaking changes', function () {
		cy.loadTestAssets ({nvl: true});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy Hello!',
				'y Some other text',
				'y More text',
				'm This is a dialog',
				'm this is another dialog',
				'nvl Now the narrator'
			]
		});

		cy.start ();
		cy.wait (100);
		cy.proceed ();
		cy.wait (100);
		cy.proceed ();
		cy.wait (100);

		cy.proceed ();
		cy.wait (100);
		cy.get ('[data-spoke="y"]').last().should ('have.class', 'nvl-dialog-footer');

		cy.proceed ();
		cy.wait (100);
		cy.proceed ();
		cy.wait (100);
		cy.proceed ();
		cy.wait (100);
		cy.get ('[data-spoke="m"]').last().should ('have.class', 'nvl-dialog-footer');
	});
});