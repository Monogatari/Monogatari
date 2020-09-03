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
				'wait 100',
				'hide video kirino with fadeOut',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn loop']);
		cy.wait (100);
		cy.get ('[data-video="kirino"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', []);
		cy.rollback ();
		cy.get ('[data-video="kirino"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'videos').should ('deep.equal', ['show video kirino displayable with fadeIn loop']);
	});
});
