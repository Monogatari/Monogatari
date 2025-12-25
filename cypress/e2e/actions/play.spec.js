context ('Play', function () {

	beforeEach (() => {
		cy.open ();
    cy.clearStorage();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Plays music correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme',
				'One'
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

	it ('Plays music with loop correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme loop',
				'One'
			]
		});

		cy.start ();

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.loop').should ('equal', true);

		cy.get ('text-box').contains ('One');
	});

	it ('Plays sound correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play sound beep',
				'One'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 0);

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('deep.equal', [{ statement: 'play sound beep', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'sound').should ('deep.equal', ['play sound beep']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 1);

		cy.get ('text-box').contains ('One');

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'sound').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 0);
	});

	it ('Plays voice correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play voice sample',
				'One'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('state', 'voice').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'voice').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'voice').should ('have.length', 0);

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'voice').should ('deep.equal', [{ statement: 'play voice sample', paused: false }]);
		cy.wrap (this.monogatari).invoke ('history', 'voice').should ('deep.equal', ['play voice sample']);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'voice').should ('have.length', 1);

		cy.get ('text-box').contains ('One');
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
		cy.wait(100);
		cy.wrap(this.monogatari).invoke('history', 'music').should('have.length', 2);
		cy.wrap(this.monogatari).invoke('history', 'music').should('deep.equal', [
			'play music theme loop',
			'play music subspace loop'
		]);
		cy.wrap(this.monogatari).invoke('state', 'music').should('deep.equal', [
			{ statement: 'play music theme loop', paused: true },
			{ statement: 'play music subspace loop', paused: true }
		]);
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
		this.monogatari.preference('Volume', { ...this.monogatari.preference('Volume'), Music: 0.25 });

		this.monogatari.script ({
			'Start': [
				'play music theme with volume 100',
				'play music subspace with volume 30',
				'One'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.volume').should ('be.closeTo', 0.25, 0.001);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.volume').should ('be.closeTo', 0.075, 0.001);

		cy.get ('text-box').contains ('One');
	});

	it ('Handles volume change correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.preference('Volume', { ...this.monogatari.preference('Volume'), Music: 0.25 });

		this.monogatari.script ({
			'Start': [
				'play music theme with volume 100',
				'play music subspace with volume 30',
				'One'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 2);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.volume').should ('be.closeTo', 0.25, 0.001);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('subspace.volume').should ('be.closeTo', 0.075, 0.001);

		cy.get ('text-box').contains ('One');

		cy.get ('[data-component="quick-menu"] [data-open="settings"]').click ();
		cy.get ('settings-screen').should ('be.visible');

		// Set the range value using native property setting and trigger input event
		cy.get('[data-action="set-volume"][data-target="music"]')
			.then($input => {
				$input[0].value = '0.7';

				$input[0].dispatchEvent(new Event('click', { bubbles: true }));
			});

		// Use a function to re-evaluate the volume on each retry
		const monogatari = this.monogatari;
		cy.wrap(null).should(() => {
			const players = monogatari.mediaPlayers('music', true);
			expect(players.theme.volume).to.be.closeTo(0.7, 0.001);
			expect(players.subspace.volume).to.be.closeTo(0.21, 0.001);
		});
	});

	it ('Plays music with fade in correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme with fade 0.5',
				'One'
			]
		});

		cy.start ();

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme with fade 0.5', paused: false }]);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);
		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);

		cy.get ('text-box').contains ('One');
	});

	it ('Resumes paused music correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play music theme loop',
				'One',
				'pause music theme',
				'Two',
				'play music theme',
				'Three'
			]
		});

		cy.start ();

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);

		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.wait(100);

		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', true);

		cy.get ('text-box').contains ('Two');

		cy.proceed ();

		cy.wrap (this.monogatari.mediaPlayers ('music', true)).its ('theme.paused').should ('equal', false);

		cy.get ('text-box').contains ('Three');
	});

	it ('Stops voice on new dialog', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'play voice sample',
				'One',
				'Two'
			]
		});

		cy.start ();

		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'voice').should ('have.length', 1);

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		// Voice should be stopped when proceeding to next dialog
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'voice').should ('have.length', 0);
		cy.wrap (this.monogatari).invoke ('state', 'voice').should ('be.empty');

		cy.get ('text-box').contains ('Two');
	});

	it ('Plays multiple sounds simultaneously', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'play sound beep loop',
				'play sound coin loop',
				'One'
			]
		});

		cy.start ();

		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		// Wait for the dialog to appear first, which confirms all actions have been processed
		cy.get ('text-box').contains ('One');

		// Then check the state - use retries to handle async loading
		cy.wrap (this.monogatari).invoke ('state', 'sound').should ('have.length', 2);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'sound').should ('have.length', 2);
	});

});