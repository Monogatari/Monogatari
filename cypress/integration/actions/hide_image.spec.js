context ('Hide Image', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Hides the image correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show image polaroid with fadeIn',
				'One',
				'hide image polaroid with fadeOut',
				'Two'
			]
		});

		cy.start ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('[data-image="polaroid"]').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('Two');

	});

	it ('Hides the image correctly and restores it after a rollback', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show image polaroid with fadeIn',
				'One',
				'hide image polaroid with fadeOut',
				'Two'
			]
		});

		cy.start ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('[data-image="polaroid"]').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('Two');
		cy.rollback ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('One');
	});

	it ('Hides the image correctly and restores it after a rollback', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'show image polaroid with fadeIn',
				'One',
				'hide image polaroid with fadeOut',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('be.empty');
		cy.get ('text-box').contains ('Zero');
		cy.proceed ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('[data-image="polaroid"]').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('Two');
		cy.rollback ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('One');
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('be.empty');
		cy.get ('text-box').contains ('Zero');
	});

	it ('Handles consecutive statements correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'show image polaroid with fadeIn',
				'show image christmas with fadeIn',
				'One',
				'hide image polaroid with fadeOut',
				'hide image christmas with fadeIn',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('be.empty');
		cy.get ('text-box').contains ('Zero');
		cy.proceed ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.get ('[data-image="christmas"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('[data-image="polaroid"]').should ('not.be.visible');
		cy.get ('[data-image="christmas"]').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
		cy.get ('text-box').contains ('Two');
		cy.rollback ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.get ('[data-image="christmas"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image christmas with fadeIn', 'show image polaroid with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
		cy.get ('text-box').contains ('One');
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('be.empty');
		cy.get ('text-box').contains ('Zero');
	});
});