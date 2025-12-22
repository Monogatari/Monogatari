context ('Pause', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Pauses sound correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play sound beep loop',
				'One',
				'pause sound beep',
				'Two'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 0);

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('deep.equal', [{ statement: 'play sound beep loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('sound', true)).its ('beep.paused').should ('equal', false);

		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.wait(100);
		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('deep.equal', [{ statement: 'play sound beep loop', paused: true }]);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('sound', true)).its ('beep.paused').should ('equal', true);

		cy.get ('text-box').contains ('Two');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('deep.equal', [{ statement: 'play sound beep loop', paused: false }]);
		cy.wrap (this.monogatari.mediaPlayers ('sound', true)).its ('beep.paused').should ('equal', false);
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
		cy.wait(100); // Add a small delay to ensure async operations complete
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
		cy.wait(100); // Add a small delay to ensure async operations complete
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
		cy.wait(100); // Add a small delay to ensure async operations complete
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
				cy.wait(100); // Add a small delay to ensure media is properly restored
				cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme', paused: true }]);
				cy.wrap (this.monogatari).invoke ('history', 'music').should ('deep.equal', ['play music theme']);
				cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
				cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', true);

				cy.get ('text-box').contains ('Two');
			});
		});
	});
});