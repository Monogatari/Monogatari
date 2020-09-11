context ('Hide Character', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Removes the character', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy with fadeIn',
				'y Hi!',
				'hide character y with fadeOut',
				'y Goodbye!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
		cy.get ('[data-sprite="happy"]').should('have.class', 'fadeIn');

		cy.proceed ();
		cy.get ('[data-sprite="happy"]').should ('not.be.visible');
	});

	it ('Shows an error if the character was not being shown.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'hide character y with fadeOut',
				'y Goodbye!'
			]
		});

		cy.start ();
		cy.get ('.fancy-error').should ('be.visible');
	});

	it ('Keeps the position of a character', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy at left with fadeIn',
				'y Hi!',
				'hide character y with fadeOut',
				'y Goodbye!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
		cy.get ('[data-sprite="happy"]').should('have.class', 'fadeIn');
		cy.get ('[data-sprite="happy"]').should('have.class', 'left');
		cy.get ('[data-sprite="happy"]').should('have.data', 'position', 'left');

		cy.proceed ();
		cy.get ('[data-sprite="happy"]').should('have.class', 'left');
		cy.get ('[data-sprite="happy"]').should('have.data', 'position', 'left');
		cy.get ('[data-sprite="happy"]').should ('not.be.visible');
	});

	it ('Forces a new position if one is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy at left with fadeIn',
				'y Hi!',
				'hide character y at center with fadeOut duration 2s',
				'y Goodbye!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
		cy.get ('[data-sprite="happy"]').should('have.class', 'fadeIn');
		cy.get ('[data-sprite="happy"]').should('have.class', 'left');
		cy.get ('[data-sprite="happy"]').should('have.data', 'position', 'left');

		cy.proceed ();
		cy.get ('[data-sprite="happy"]').should('have.class', 'center');
		cy.get ('[data-sprite="happy"][data-position="center"]').should('exist');
		cy.get ('[data-sprite="happy"]').should('not.have.class', 'left');
		cy.get ('[data-sprite="happy"]').should ('not.be.visible');
	});

	it ('Engages the end-animation once the main one is over.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y normal at center with fadeIn end-fadeOut',
				'y Tada!',
				'hide character y',
				'wait 5000',
				//'show character y happy with rollInLeft',
			]
		});

		cy.start ();

		cy.get ('[data-sprite="normal"]').should ('be.visible');
		cy.proceed ();
		cy.get ('[data-sprite="normal"]').should ('not.be.visible');
	});

	it ('Makes the character show up again when rolled back.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y normal at center with fadeIn end-fadeOut',
				'Before',
				'hide character y with left',
				'After',
				//'show character y happy with rollInLeft',
			]
		});

		cy.start ();

		cy.get ('[data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at center with fadeIn end-fadeOut']);
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at center with fadeIn end-fadeOut']);
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.get ('[data-sprite="normal"]').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at center with fadeIn end-fadeOut']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('be.empty');
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.get ('[data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at center with fadeIn end-fadeOut']);
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at center with fadeIn end-fadeOut']);
		cy.get ('text-box').contains ('Before');
	});
});