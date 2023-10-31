context ('Pause', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Pauses music correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme',
				'One',
				'pause music theme',
				'Two'
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

		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme', paused: true }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', true);

		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);
	});

	it ('Pauses all music correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme loop',
				'play music subspace loop',
				'One',
				'pause music',
				'Two'
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
				'pause music theme',
				'Two',
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

		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme', paused: true }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', true);

		cy.get ('text-box').contains ('Two');

		cy.save(1).then(() => {
			cy.proceed ();
			cy.get('main-screen').should ('be.visible');
			cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('history', 'music').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);

			cy.load(1).then(() => {
				cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme', paused: true }]);
				cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme']);
				cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
				cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', true);

				cy.get ('text-box').contains ('Two');
			});
		});
	});
});