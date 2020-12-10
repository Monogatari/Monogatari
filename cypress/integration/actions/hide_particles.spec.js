context ('Hide Particles', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});


	it ('Stops and removes the particle system', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show particles snow',
				'One',
				'hide particles',
				'Two'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', 'show particles snow');
		cy.get ('.tsparticles-canvas-el').should ('be.visible');
		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', '');
		cy.get ('.tsparticles-canvas-el').should ('not.exist');
		cy.get ('text-box').contains ('Two');
	});

	it ('Restores the particle system when rolled back', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show particles snow',
				'One',
				'hide particles',
				'Two'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', 'show particles snow');
		cy.get ('.tsparticles-canvas-el').should ('be.visible');
		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', '');
		cy.get ('.tsparticles-canvas-el').should ('not.exist');
		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('history', 'particle').should ('deep.equal', ['show particles snow']);
		cy.wrap (this.monogatari).invoke ('state', 'particles').should ('equal', 'show particles snow');
		cy.get ('.tsparticles-canvas-el').should ('be.visible');
		cy.get ('text-box').contains ('One');
	});
});