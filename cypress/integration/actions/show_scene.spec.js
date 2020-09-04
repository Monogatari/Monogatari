context ('Show Scene', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Restores characters correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y normal at left',
				'show character m normal at right',
				'y One',
				'show scene black',
				'show character m angry at right',
				'm Two',
				'show scene white',
				'show character y angry at left',
				'y Three'
			]
		});

		cy.start ();
		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.get ('text-box').contains ('One');

		cy.proceed();

		cy.get ('[data-character="y"][data-sprite="normal"]').should ('not.be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('not.be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right', 'show character m angry at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character m angry at right']);
		cy.get ('text-box').contains ('Two');

		cy.proceed();

		cy.get ('[data-character="y"][data-sprite="angry"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right', 'show character m angry at right', 'show character y angry at left']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry at left']);
		cy.get ('text-box').contains ('Three');
		cy.rollback ();

		cy.get ('[data-character="y"][data-sprite="normal"]').should ('not.be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('not.be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('be.visible');
		cy.get ('[data-character="y"][data-sprite="angry"]').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right', 'show character m angry at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character m angry at right']);
		cy.get ('text-box').contains ('Two');
		cy.rollback ();

		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('not.be.visible');
		cy.get ('[data-character="y"][data-sprite="angry"]').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.get ('text-box').contains ('One');

	});

});