context ('Show Video', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Allows the game to continue while playing a background video', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video dandelion background with fadeIn',
				'One',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('text-box').contains ('Two');
	});

	it ('Closes the video automatically and proceeds to the next statement when close was provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video dandelion immersive with fadeIn close',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (26000);
		cy.get ('text-box').contains ('Tada!');
	});
});