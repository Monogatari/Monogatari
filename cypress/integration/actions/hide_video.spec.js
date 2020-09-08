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
		cy.get ('[data-video="kirino"]').should ('not.be.visible');
		cy.get ('[data-video="dandelion"]').should ('not.be.visible');
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
});
