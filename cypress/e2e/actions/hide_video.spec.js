context ('Hide Video', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Removes video element when it gets hidden by the script', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino displayable with fadeIn loop',
				'wait 100',
				'hide video kirino with fadeOut',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (100);
		cy.get ('[data-video="kirino"]').should ('not.exist');
	});

	it ('Removes video element immediately without animation', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino displayable loop',
				'One',
				'hide video kirino',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-video="kirino"]').should ('be.visible');
		cy.proceed ();
		cy.get ('[data-video="kirino"]').should ('not.exist');
	});

	it ('Restores video element when rolling back', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino displayable with fadeIn loop',
				'One',
				'hide video kirino with fadeOut',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn loop']);

		cy.proceed ();
		cy.get ('[data-video="kirino"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', []);
		cy.rollback ();
		cy.get ('[data-video="kirino"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn loop']);
	});

	it ('Restores video element when rolling back', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show video kirino displayable with fadeIn loop',
				'show video dandelion displayable with fadeIn loop',
				'Two',
				'hide video dandelion with fadeOut',
				'hide video kirino with fadeOut',
				'Three'
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

		cy.proceed ();
		cy.get ('[data-video="kirino"]').should ('not.exist');
		cy.get ('[data-video="dandelion"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('deep.equal', ['show video kirino displayable with fadeIn loop', 'show video dandelion displayable with fadeIn loop']);
		cy.get ('text-box').contains ('Three');

		cy.rollback ();
		cy.get ('[data-video="kirino"]').should ('be.visible');
		cy.get ('[data-video="dandelion"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn loop', 'show video dandelion displayable with fadeIn loop']);
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('deep.equal', ['show video kirino displayable with fadeIn loop', 'show video dandelion displayable with fadeIn loop']);
		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('be.empty');
		cy.get ('text-box').contains ('One');

	});

	it ('Updates state correctly when hiding a video', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino displayable loop',
				'One',
				'hide video kirino',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable loop']);
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('be.empty');
		cy.get ('text-box').contains ('Two');
	});

	it ('Preserves history when hiding a video', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino displayable loop',
				'One',
				'hide video kirino',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('deep.equal', ['show video kirino displayable loop']);
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		// History should still contain the video even after hiding
		cy.wrap (this.monogatari).invoke ('history', 'video').should ('deep.equal', ['show video kirino displayable loop']);
		cy.get ('text-box').contains ('Two');
	});

	it ('Hides video with animation class', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino displayable loop',
				'One',
				'hide video kirino with fadeOut',
				'Two'
			]
		});

		cy.start ();
		cy.get ('[data-video="kirino"]').should ('be.visible');
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		// After animation ends, video should be removed
		cy.get ('[data-video="kirino"]').should ('not.exist');
		cy.get ('text-box').contains ('Two');
	});

	it ('Hides only the specified video when multiple exist', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show video kirino displayable loop',
				'show video dandelion displayable loop',
				'One',
				'hide video kirino',
				'Two'
			]
		});

		cy.start ();
		cy.get ('[data-video="kirino"]').should ('be.visible');
		cy.get ('[data-video="dandelion"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('have.length', 2);
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.get ('[data-video="kirino"]').should ('not.exist');
		cy.get ('[data-video="dandelion"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video dandelion displayable loop']);
		cy.get ('text-box').contains ('Two');
	});
});
