context ('Show Particles', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});


	it ('Starts the particle system', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show particles snow',
				'One',
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', 'show particles snow');
		cy.get ('.tsparticles-canvas-el').should ('be.visible');
	});

	it ('Restores the particle system when rolled back', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'show particles snow',
				'One',
				'hide particles snow',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', '');
		cy.get ('.tsparticles-canvas-el').should ('not.be.visible');
		cy.get ('text-box').contains ('Zero');
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', 'show particles snow');
		cy.get ('.tsparticles-canvas-el').should ('be.visible');
		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', '');
		cy.get ('.tsparticles-canvas-el').should ('not.be.visible');
		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', 'show particles snow');
		cy.get ('.tsparticles-canvas-el').should ('be.visible');
		cy.get ('text-box').contains ('One');

		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', '');
		cy.get ('.tsparticles-canvas-el').should ('not.be.visible');
		cy.get ('text-box').contains ('Zero');
	});

	it ('Handles consecutive shows correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show particles snow',
				'show particles fireflies',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', '');
		cy.get ('.tsparticles-canvas-el').should ('not.be.visible');
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow', 'show particles fireflies']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', 'show particles fireflies');
		cy.get ('.tsparticles-canvas-el').should ('be.visible');
		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', '');
		cy.get ('.tsparticles-canvas-el').should ('not.be.visible');
		cy.get ('text-box').contains ('One');

	});
});