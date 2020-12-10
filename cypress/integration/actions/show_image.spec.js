context ('Show Image', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays the image correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show image polaroid with fadeIn',
				'One'
			]
		});

		cy.start ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('One');
	});

	it ('Displays the image correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show image polaroid with fadeIn',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('be.empty');
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn']);
		cy.get ('text-box').contains ('Two');
		cy.rollback ();
		cy.get ('[data-image="polaroid"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('be.empty');
		cy.get ('text-box').contains ('One');
	});

	it ('Adds the center position by default if none was provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show image polaroid',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-image="polaroid"]').should ('have.class', 'center');
		cy.get ('[data-image="polaroid"]').should ('have.data', 'position', 'center');
	});

	it ('Sets the data position property correctly when one is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show image polaroid at left',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-image="polaroid"]').should ('have.class', 'left');
		cy.get ('[data-image="polaroid"]').should ('have.data', 'position', 'left');
	});

	it ('Handles consecutive statements correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show image polaroid with fadeIn',
				'show image christmas with fadeIn',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('be.empty');
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.get ('[data-image="christmas"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
		cy.get ('text-box').contains ('Two');
		cy.rollback ();
		cy.get ('[data-image="polaroid"]').should ('not.exist');
		cy.get ('[data-image="christmas"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('be.empty');
		cy.get ('text-box').contains ('One');
	});

	it ('Restores state correctly after load', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show image polaroid with fadeIn',
				'show image christmas with fadeIn',
				'One',
				'end'
			]
		});

		cy.start ();
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.get ('[data-image="christmas"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
		cy.get ('text-box').contains ('One');

		cy.save(1).then(() => {
			cy.proceed ();
			cy.get('main-screen').should ('be.visible');
			cy.get ('[data-image]').should ('not.exist');
			cy.wrap (this.monogatari).invoke ('state', 'images').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('history', 'image').should ('be.empty');

			cy.load(1).then(() => {
				cy.get('main-screen').should ('not.be.visible');
				cy.get('game-screen').should ('be.visible');
				cy.get ('[data-image="polaroid"]').should ('be.visible');
				cy.get ('[data-image="christmas"]').should ('be.visible');
				cy.wrap (this.monogatari).invoke ('state', 'images').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
				cy.wrap (this.monogatari).invoke ('history', 'image').should ('deep.equal', ['show image polaroid with fadeIn', 'show image christmas with fadeIn']);
				cy.get ('text-box').contains ('One');
			});
		});
	});
});