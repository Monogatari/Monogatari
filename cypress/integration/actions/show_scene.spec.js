context ('Show Scene', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Restores characters correctly on rollback', function () {
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

		cy.get ('[data-character="y"][data-sprite="normal"]').should ('not.exist');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('not.exist');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right', 'show character m angry at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character m angry at right']);
		cy.get ('text-box').contains ('Two');

		cy.proceed();

		cy.get ('[data-character="y"][data-sprite="angry"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right', 'show character m angry at right', 'show character y angry at left']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry at left']);
		cy.get ('text-box').contains ('Three');
		cy.rollback ();

		cy.get ('[data-character="y"][data-sprite="normal"]').should ('not.exist');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('not.exist');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('be.visible');
		cy.get ('[data-character="y"][data-sprite="angry"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right', 'show character m angry at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character m angry at right']);
		cy.get ('text-box').contains ('Two');
		cy.rollback ();

		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('not.exist');
		cy.get ('[data-character="y"][data-sprite="angry"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.get ('text-box').contains ('One');

	});

	it ('Restores scene correctly after load', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show scene green',
				'show character y normal at left',
				'show character m normal at right',
				'y One',
				'end'
			]
		});

		cy.start ();

		cy.get ('#background').should ('have.css', 'background-color', 'rgb(0, 128, 0)');
		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);

		cy.wrap (this.monogatari).invoke ('state', 'scene').should ('equal', 'show scene green');
		cy.wrap (this.monogatari).invoke ('history', 'scene').should ('deep.equal', ['show scene green']);

		cy.wrap (this.monogatari).invoke ('history', 'background').should ('deep.equal', ['show background green']);
		cy.wrap (this.monogatari).invoke ('state', 'background').should ('equal', 'show background green');


		cy.get ('text-box').contains ('One');

		cy.save(1).then(() => {
			cy.proceed ();
			cy.get('main-screen').should ('be.visible');
			cy.get ('[data-image]').should ('not.exist');
			cy.wrap (this.monogatari).invoke ('state', 'characters').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('history', 'characters').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('state', 'scene').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('history', 'scene').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('state', 'background').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('history', 'background').should ('be.empty');

			cy.load(1).then(() => {
				cy.get('main-screen').should ('not.be.visible');
				cy.get('game-screen').should ('be.visible');
				cy.get ('#background').should ('have.css', 'background-color', 'rgb(0, 128, 0)');
				cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
				cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
				cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
				cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);

				cy.wrap (this.monogatari).invoke ('history', 'scene').should ('deep.equal', ['show scene green']);
				cy.wrap (this.monogatari).invoke ('state', 'scene').should ('equal', 'show scene green');

				cy.wrap (this.monogatari).invoke ('history', 'background').should ('deep.equal', ['show background green']);
				cy.wrap (this.monogatari).invoke ('state', 'background').should ('equal', 'show background green');


				cy.get ('text-box').contains ('One');
			});
		});

	});


});