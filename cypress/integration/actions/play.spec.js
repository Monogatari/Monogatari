context ('Play', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Plays music correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme',
				'One',
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);

		cy.get ('text-box').contains ('One');
		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);
	});

	it ('Plays all music correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme loop',
				'play music subspace loop',
				'One',
				'pause music',
				'Two',
				'play music',
				'Three'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme loop', paused: false }, { statement: 'play music subspace loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme loop', 'play music subspace loop']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.paused').should ('equal', false);

		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme loop', paused: true }, { statement: 'play music subspace loop', paused: true }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme loop', 'play music subspace loop']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', true);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.paused').should ('equal', true);

		cy.get ('text-box').contains ('Two');
		cy.wait (100);
		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme loop', paused: false }, { statement: 'play music subspace loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme loop', 'play music subspace loop']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.paused').should ('equal', false);

		cy.get ('text-box').contains ('Three');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme loop', paused: true }, { statement: 'play music subspace loop', paused: true }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme loop', 'play music subspace loop']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', true);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.paused').should ('equal', true);

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme loop', paused: false }, { statement: 'play music subspace loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme loop', 'play music subspace loop']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.paused').should ('equal', false);

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);
	});

	it ('Restores music correctly after load', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme',
				'One',
				'end'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);

		cy.get ('text-box').contains ('One');

		cy.save(1).then(() => {
			cy.proceed ();
			cy.get('main-screen').should ('be.visible');
			cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('history', 'music').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);

			cy.load(1).then(() => {
				cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme', paused: false }]);
				cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme']);
				cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
				cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);

				cy.get ('text-box').contains ('One');
			});
		});
	});

	it ('Sets player volume correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.preference('Volume').Music = 0.25;

		this.monogatari.script ({
			'Start': [
				'play music theme with volume 100',
				'play music subspace with volume 30',
				'One'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.volume').should ('equal', 0.25);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.volume').should ('equal', 0.075);

		cy.get ('text-box').contains ('One');
	});

	it ('Handles volume change correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.preference('Volume').Music = 0.25;

		this.monogatari.script ({
			'Start': [
				'play music theme with volume 100',
				'play music subspace with volume 30',
				'One'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.volume').should ('equal', 0.25);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.volume').should ('equal', 0.075);

		cy.get ('text-box').contains ('One');

		cy.get ('[data-component="quick-menu"] [data-open="settings"]').click ();
		cy.get ('settings-screen').should ('be.visible');

		cy.get('[data-action="set-volume"][data-target="music"]').as('range').invoke('val', 0.7).trigger('mouseover');
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.volume').should ('equal', 0.7);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.volume').should ('equal', 0.21);
	});

});