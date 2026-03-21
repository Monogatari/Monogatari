context ('Dialog Log Scrolling', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Scrolls to the bottom when opened', function () {
		this.monogatari.setting ('TypeAnimation', false);

		// Create enough dialogs to guarantee the log overflows
		const dialogs = [];
		for (let i = 1; i <= 30; i++) {
			dialogs.push (`Dialog entry number ${i} with some extra text to ensure overflow`);
		}

		this.monogatari.script ({
			'Start': dialogs
		});

		cy.start ();

		for (let i = 0; i < 29; i++) {
			cy.proceed ();
		}

		cy.get ('[data-component="quick-menu"] [data-action="dialog-log"]').click ();
		cy.get ('dialog-log').should ('have.class', 'modal--active');

		cy.get ('dialog-log [data-content="log"]').should (($log) => {
			const log = $log[0];

			expect (log.scrollHeight).to.be.greaterThan (log.clientHeight);
			expect (log.scrollTop + log.clientHeight).to.be.closeTo (log.scrollHeight, 5);
		});
	});

	it ('Contains all dialog entries', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y First',
				'm Second',
				'Third'
			]
		});

		cy.start ();
		cy.proceed ();
		cy.proceed ();

		cy.get ('dialog-log [data-spoke]').should ('have.length', 3);
		cy.get ('dialog-log [data-spoke="y"]').contains ('First');
		cy.get ('dialog-log [data-spoke="m"]').contains ('Second');
		cy.get ('dialog-log [data-spoke="_narrator"]').contains ('Third');
	});

	it ('Removes entries on rollback', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'Two',
				'Three'
			]
		});

		cy.start ();
		cy.proceed ();
		cy.proceed ();

		cy.get ('dialog-log [data-spoke]').should ('have.length', 3);

		cy.rollback ();
		cy.get ('dialog-log [data-spoke]').should ('have.length', 2);

		cy.rollback ();
		cy.get ('dialog-log [data-spoke]').should ('have.length', 1);
	});

	it ('Displays placeholder when no dialogs exist', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'end'
			]
		});

		cy.start ();

		cy.get ('dialog-log [data-spoke]').should ('have.length', 1);

		cy.wrap (this.monogatari).invoke ('resetGame');
		cy.wait (200);

		cy.get ('dialog-log [data-content="placeholder"]').should ('exist');
		cy.get ('dialog-log [data-content="placeholder"]').contains ('No dialogs available');
	});
});
