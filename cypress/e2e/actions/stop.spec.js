context ('Stop', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Stops sound correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play sound beep loop',
				'One',
				'stop sound beep',
				'Two'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 0);

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('deep.equal', [{ statement: 'play sound beep loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'sound').should ('deep.equal', ['play sound beep loop']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 1);

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'sound').should ('deep.equal', ['play sound beep loop']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 0);

		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('deep.equal', [{ statement: 'play sound beep loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 1);
	});

	it ('Stops music correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme',
				'One',
				'stop music theme',
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
		cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);

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

	it ('Stops all music correctly', function () {
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
				'Three',
				'stop music',
				'Four'
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

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme loop', 'play music subspace loop', [{ statement: 'play music theme loop', paused: false }, { statement: 'play music subspace loop', paused: false }]]);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);

		cy.get ('text-box').contains ('Four');

		cy.rollback ();

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

	it ('Stops only the desired music', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme loop',
				'play music subspace loop',
				'One',
				'stop music theme',
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

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music subspace loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme loop', 'play music subspace loop']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.paused').should ('equal', false);

		cy.get ('text-box').contains ('Two');

	});

	it ('Doesn\'t stop everything if an invalid name is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme loop',
				'play music subspace loop',
				'One',
				'stop music whatever',
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
		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme loop', paused: false }, { statement: 'play music subspace loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme loop', 'play music subspace loop']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.paused').should ('equal', false);

		cy.get ('text-box').contains ('Two');
	});

	it ('Stops music with fade out correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme',
				'One',
				'stop music theme with fade 0.3',
				'Two'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);

		cy.get ('text-box').contains ('One');

		cy.proceed ();
		// Wait for fade to complete
		cy.wait(400);

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 0);

		cy.get ('text-box').contains ('Two');
	});

	it ('Stops all sounds correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play sound beep loop',
				'play sound coin loop',
				'One',
				'stop sound',
				'Two'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 0);

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('have.length', 2);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 2);

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 0);

		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('have.length', 2);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 2);
	});

});