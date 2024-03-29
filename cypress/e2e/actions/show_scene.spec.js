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
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', [
			{
				statement: 'show character y normal at left',
				previous: null
			},
			{
				statement: 'show character m normal at right',
				previous: null
			}
		]);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.get ('text-box').contains ('One');

		cy.proceed();

		cy.get ('[data-character="y"][data-sprite="normal"]').should ('not.exist');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('not.exist');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', [
			{
				statement: 'show character y normal at left',
				previous: null
			},
			{
				statement: 'show character m normal at right',
				previous: null
			},
			{
				statement: 'show character m angry at right',
				previous: null
			}
		]);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character m angry at right']);
		cy.get ('text-box').contains ('Two');

		cy.proceed();

		cy.get ('[data-character="y"][data-sprite="angry"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', [
			{
				statement: 'show character y normal at left',
				previous: null
			},
			{
				statement: 'show character m normal at right',
				previous: null
			},
			{
				statement: 'show character m angry at right',
				previous: null
			},
			{
				statement: 'show character y angry at left',
				previous: null
			}
		]);

		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry at left']);
		cy.get ('text-box').contains ('Three');
		cy.rollback ();

		cy.get ('[data-character="y"][data-sprite="normal"]').should ('not.exist');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('not.exist');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('be.visible');
		cy.get ('[data-character="y"][data-sprite="angry"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', [
			{
				statement: 'show character y normal at left',
				previous: null
			},
			{
				statement: 'show character m normal at right',
				previous: null
			},
			{
				statement: 'show character m angry at right',
				previous: null
			}
		]);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character m angry at right']);
		cy.get ('text-box').contains ('Two');
		cy.rollback ();

		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('not.exist');
		cy.get ('[data-character="y"][data-sprite="angry"]').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', [
			{
				statement: 'show character y normal at left',
				previous: null
			},
			{
				statement: 'show character m normal at right',
				previous: null
			}
		]);
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
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', [
			{
				statement: 'show character y normal at left',
				previous: null
			},
			{
				statement: 'show character m normal at right',
				previous: null
			}
		]);
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
				cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', [
					{
						statement: 'show character y normal at left',
						previous: null
					},
					{
						statement: 'show character m normal at right',
						previous: null
					}
				]);
				cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);

				cy.wrap (this.monogatari).invoke ('history', 'scene').should ('deep.equal', ['show scene green']);
				cy.wrap (this.monogatari).invoke ('state', 'scene').should ('equal', 'show scene green');

				cy.wrap (this.monogatari).invoke ('history', 'background').should ('deep.equal', ['show background green']);
				cy.wrap (this.monogatari).invoke ('state', 'background').should ('equal', 'show background green');


				cy.get ('text-box').contains ('One');
			});
		});

	});



	it ('Shows the correct background on when both scene and background are used', function () {
		// https://github.com/Monogatari/Monogatari/pull/154

		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show scene #555555 with fadeIn',
				'show background christmas with fadeIn',
				'Hello.',
				'end',
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('state', 'scene').should ('equal', 'show scene #555555 with fadeIn');
		cy.wrap (this.monogatari).invoke ('history', 'scene').should ('deep.equal', ['show scene #555555 with fadeIn']);

		cy.wrap (this.monogatari).invoke ('state', 'background').should ('equal', 'show background christmas with fadeIn');
		cy.wrap (this.monogatari).invoke ('history', 'background').should ('deep.equal', ['show background #555555 with fadeIn', 'show background christmas with fadeIn']);


		cy.get ('text-box').contains ('Hello');

		cy.save (1);
		cy.proceed ();
		cy.get ('[data-component="main-menu"] [data-action="open-screen"][data-open="load"]').click ();
		cy.get ('[data-component="load-screen"]').should ('be.visible');
		cy.get ('[data-component="load-screen"] [data-component="save-slot"]').last ().click ();

		cy.get ('text-box').contains ('Hello');

		cy.wrap (this.monogatari).invoke ('history', 'background').should ('deep.equal', ['show background #555555 with fadeIn', 'show background christmas with fadeIn']);
		cy.wrap (this.monogatari).invoke ('state', 'background').should ('equal', 'show background christmas with fadeIn');

		cy.get ('#background').should ('have.css', 'background-image', 'url("https://datadyne.perfectdark.space/monogatari/assets/images/christmas.png")');

	});





});