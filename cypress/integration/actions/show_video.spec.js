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
				'show video kirino background with fadeIn',
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
				'show video kirino immersive with fadeIn close',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (6000);
		cy.get ('text-box').contains ('Tada!');
	});

	it ('Closes the video automatically and proceeds to the next statement when close was provided on background mode', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino background with fadeIn close',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (6000);
		cy.get ('text-box').contains ('Tada!');
	});

	it ('Removes the video from the state when closed automatically on immersive mode', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino immersive with fadeIn close',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (6000);
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
	});

	it ('Removes the video from the state when closed automatically on background mode', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino background with fadeIn close',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (6000);
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
	});

	it ('Only removes the last video that completely matches the statement', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino background with fadeIn close',
				'wait 100',
				'show video kirino displayable with fadeIn',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait(100);
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino background with fadeIn close', 'show video kirino displayable with fadeIn']);
		cy.wait (5000);
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn']);
		cy.get ('[data-video="kirino"][data-mode="displayable"]').should ('be.visible');
	});

	it ('Displays an error when an invalid mode was provided.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino whatever with fadeIn loop',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('.fancy-error').should ('be.visible');
	});

	it ('Removes video on rollback', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show video kirino displayable with fadeIn loop',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('be.empty');
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.get ('[data-video="kirino"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn loop']);
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('deep.equal', ['show video kirino displayable with fadeIn loop']);
		cy.get ('text-box').contains ('Two');

		cy.rollback ();
		cy.get ('[data-video="kirino"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('be.empty');
		cy.get ('text-box').contains ('One');
	});

	it ('Handles consecutive statements correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show video kirino displayable with fadeIn loop',
				'show video dandelion displayable with fadeIn loop',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('be.empty');
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.get ('[data-video="kirino"]').should ('be.visible');
		cy.get ('[data-video="dandelion"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn loop', 'show video dandelion displayable with fadeIn loop']);
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('deep.equal', ['show video kirino displayable with fadeIn loop', 'show video dandelion displayable with fadeIn loop']);
		cy.get ('text-box').contains ('Two');

		cy.rollback ();
		cy.get ('[data-video="kirino"]').should ('not.exist');
		cy.get ('[data-video="dandelion"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('be.empty');
		cy.get ('text-box').contains ('One');
	});

	it ('Restores state correctly on load', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show video kirino displayable with fadeIn loop',
				'show video dandelion displayable with fadeIn loop',
				'Two',
				'end'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('be.empty');
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.get ('[data-video="kirino"]').should ('be.visible');
		cy.get ('[data-video="dandelion"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn loop', 'show video dandelion displayable with fadeIn loop']);
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('deep.equal', ['show video kirino displayable with fadeIn loop', 'show video dandelion displayable with fadeIn loop']);
		cy.get ('text-box').contains ('Two');

		cy.save(1).then(() => {
			cy.proceed ();
			cy.get('main-screen').should ('be.visible');
			cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('history', 'video').should ('be.empty');
			cy.get ('[data-video]').should ('not.exist');

			cy.load(1).then(() => {
				cy.get('main-screen').should ('not.be.visible');
				cy.get('game-screen').should ('be.visible');
				cy.get ('[data-video="kirino"]').should ('be.visible');
				cy.get ('[data-video="dandelion"]').should ('be.visible');
				cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn loop', 'show video dandelion displayable with fadeIn loop']);
				cy.wrap (this.monogatari).invoke ('history', 'video').should ('deep.equal', ['show video kirino displayable with fadeIn loop', 'show video dandelion displayable with fadeIn loop']);
				cy.get ('text-box').contains ('Two');
			});
		});
	});
});
