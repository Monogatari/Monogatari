context ('Show Video', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
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

	it ('Closes the video automatically and proceeds to the next statement when close was provided on immersive mode', function () {
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

	it ('Closes the video automatically and proceeds to the next statement when close was provided on background mode', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video dandelion background with fadeIn close',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (26000);
		cy.get ('text-box').contains ('Tada!');
	});

	it ('Removes the video from the state when closed automatically on immersive mode', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video dandelion immersive with fadeIn close',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (26000);
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
	});

	it ('Removes the video from the state when closed automatically on background mode', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video dandelion background with fadeIn close',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (26000);
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
	});

	it ('Only removes the last video that completely matches the statement', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video dandelion background with fadeIn close',
				'wait 100',
				'show video dandelion displayable with fadeIn',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (26000);
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video dandelion displayable with fadeIn']);
		cy.get ('[data-video="dandelion"][data-mode="displayable"]').should ('be.visible');
	});

	it ('Removes video element when it gets hidden by the script', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video dandelion displayable with fadeIn loop',
				'wait 100',
				'hide video dandelion with fadeOut',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (100);
		cy.get ('[data-video="dandelion"]').should ('not.exist');
	});

	it ('Displays an error when an invalid mode was provided.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video dandelion whatever with fadeIn loop',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('.fancy-error').should ('be.visible');
	});
});
