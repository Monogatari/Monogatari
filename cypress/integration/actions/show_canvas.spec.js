context ('Show Canvas', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays a default base layer if none is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show canvas square displayable with fadeIn',
				'y Tada!'
			]
		});

		cy.start ();
        cy.get ('[data-layer="base"]').should ('be.visible');
		cy.get ('[canvas="square"]').should('have.class', 'fadeIn');
	});

	it ('Displays provided layers correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show canvas stars background with fadeIn',
				'y Tada!'
			]
		});

		cy.start ();
        cy.get ('[data-layer="sky"]').should ('be.visible');
        cy.get ('[data-layer="stars"]').should ('be.visible');
		cy.get ('[canvas="stars"]').should('have.class', 'fadeIn');
	});

	it ('Allows the game to continue while showing background canvas', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show canvas stars background with fadeIn',
				'One',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('text-box').contains ('Two');
	});


	it ('Removes canvas on rollback', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show canvas stars displayable with fadeIn',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('be.empty');
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.get ('[canvas="stars"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars displayable with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars displayable with fadeIn']);
		cy.get ('text-box').contains ('Two');

		cy.rollback ();
		cy.get ('[canvas="stars"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('be.empty');
		cy.get ('text-box').contains ('One');
	});

	it ('Allows hiding the canvas from its object functions', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show canvas circle background with fadeIn',
				'wait 5000',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[canvas="circle"]').should ('be.visible');
		cy.wait (6000);
		cy.get ('text-box').contains ('Tada!');
		cy.get ('[canvas="circle"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
	});


	it ('Only removes the last canvas that completely matches the statement', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show canvas stars background with fadeIn',
				'One',
				'show canvas stars displayable with fadeIn',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn']);
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn', 'show canvas stars displayable with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn', 'show canvas stars displayable with fadeIn']);
		cy.get ('text-box').contains ('Two');

		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn']);
		cy.get ('text-box').contains ('One');
		cy.get ('[canvas="stars"][mode="background"]').should ('be.visible');
		cy.get ('[canvas="stars"][mode="displayable"]').should ('not.exist');

	});

	it ('Handles consecutive statements correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show canvas stars background with fadeIn',
				'show canvas square displayable with fadeIn',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('be.empty');
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.get ('[canvas="stars"]').should ('be.visible');
		cy.get ('[canvas="square"]').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn', 'show canvas square displayable with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn', 'show canvas square displayable with fadeIn']);
		cy.get ('text-box').contains ('Two');

		cy.rollback ();
		cy.get ('[canvas="stars"]').should ('not.exist');
		cy.get ('[canvas="square"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('be.empty');
		cy.get ('text-box').contains ('One');
	});

	it ('Restores state correctly on load', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show canvas stars background with fadeIn',
				'show canvas square displayable with fadeIn',
				'Two',
				'end'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('be.empty');
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.get ('[canvas="stars"]').should ('be.visible');
		cy.get ('[canvas="square"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn', 'show canvas square displayable with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn', 'show canvas square displayable with fadeIn']);
		cy.get ('text-box').contains ('Two');

		cy.save(1).then(() => {
			cy.proceed ();
			cy.get('main-screen').should ('be.visible');
			cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('be.empty');
			cy.get ('[canvas]').should ('not.exist');

			cy.load(1).then(() => {
				cy.get('main-screen').should ('not.be.visible');
				cy.get('game-screen').should ('be.visible');
				cy.get ('[canvas="stars"]').should ('be.visible');
				cy.get ('[canvas="square"]').should ('be.visible');
				cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn', 'show canvas square displayable with fadeIn']);
				cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars background with fadeIn', 'show canvas square displayable with fadeIn']);
				cy.get ('text-box').contains ('Two');
			});
		});
	});

});
