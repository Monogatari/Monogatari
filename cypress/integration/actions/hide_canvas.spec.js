context ('Hide Canvas', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Removes canvas element when it gets hidden by the script', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show canvas stars displayable with fadeIn',
				'wait 100',
				'hide canvas stars with fadeOut',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wait (100);
		cy.get ('[canvas="stars"]').should ('not.exist');
	});

	it ('Restores canvas element when rolling back', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show canvas stars displayable with fadeIn',
				'One',
				'hide canvas stars with fadeOut',
				'y Tada!'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars displayable with fadeIn']);

		cy.proceed ();
		cy.get ('[canvas="stars"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', []);
		cy.rollback ();
		cy.get ('[canvas="stars"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars displayable with fadeIn']);
	});

	it ('Restores canvas element when rolling back', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show canvas stars displayable with fadeIn',
				'show canvas square displayable with fadeIn',
				'Two',
				'hide canvas square with fadeOut',
				'hide canvas stars with fadeOut',
				'Three'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('be.empty');
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.get ('[canvas="stars"]').should ('be.visible');
		cy.get ('[canvas="square"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars displayable with fadeIn', 'show canvas square displayable with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars displayable with fadeIn', 'show canvas square displayable with fadeIn']);
		cy.get ('text-box').contains ('Two');

		cy.proceed ();
		cy.get ('[canvas="stars"]').should ('not.be.visible');
		cy.get ('[canvas="square"]').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars displayable with fadeIn', 'show canvas square displayable with fadeIn']);
		cy.get ('text-box').contains ('Three');

		cy.rollback ();
		cy.get ('[canvas="stars"]').should ('be.visible');
		cy.get ('[canvas="square"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('deep.equal', ['show canvas stars displayable with fadeIn', 'show canvas square displayable with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('deep.equal', ['show canvas stars displayable with fadeIn', 'show canvas square displayable with fadeIn']);
		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'canvas').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'canvas').should ('be.empty');
		cy.get ('text-box').contains ('One');

	});
});
