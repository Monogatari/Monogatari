context ('Show TextBox', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Shows the textbox after being hidden', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'show textbox',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('Two');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Reverts back to hidden state on rollback', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'hide textbox',
				'show image polaroid',
				'show textbox',
				'One',
				'Two'
			]
		});

		cy.start ();

    cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('One');
		cy.get ('[data-image="polaroid"]').should ('be.visible');

		cy.proceed ();
		cy.get ('text-box').contains ('Two');

		cy.rollback ();
		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('One');
	});

	it ('Handles multiple hide/show cycles', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'show textbox',
				'Two',
				'hide textbox',
				'show textbox',
				'Three'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('Two');
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('Three');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Works with character show while hidden', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'show character y normal',
				'show textbox',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('Two');
		cy.get ('[data-character="y"]').should ('be.visible');
	});

	it ('Restores shown textbox state after save and load', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'show textbox',
				'Two',
				'Three'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('Two');
		cy.save (1);

		cy.proceed ();
		cy.get ('text-box').contains ('Three');

		cy.proceed ();
		cy.get ('[data-component="main-menu"] [data-action="open-screen"][data-open="load"]').click ();
		cy.get ('[data-component="load-screen"] [data-component="save-slot"]').first ().click ();
		cy.get ('[data-component="game-screen"]').should ('be.visible');

		cy.get ('text-box').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Restores shown textbox with images after save and load', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'hide textbox',
				'show image polaroid',
				'show textbox',
				'One',
				'Two'
			]
		});

		cy.start ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('One');
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.save (1);

		cy.proceed ();
		cy.get ('text-box').contains ('Two');

		cy.proceed ();
		cy.get ('[data-component="main-menu"] [data-action="open-screen"][data-open="load"]').click ();
		cy.get ('[data-component="load-screen"] [data-component="save-slot"]').first ().click ();
		cy.get ('[data-component="game-screen"]').should ('be.visible');

		cy.get ('text-box').should ('be.visible');
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Shows the textbox after being hidden in NVL mode', function () {
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y One',
				'hide textbox',
				'show textbox',
				'y Two'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('element').invoke ('find', 'text-box').invoke ('get', 0).its ('props.mode').should ('equal', 'nvl');
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Handles multiple hide/show cycles in NVL mode', function () {
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y One',
				'hide textbox',
				'show textbox',
				'y Two',
				'hide textbox',
				'show textbox',
				'y Three'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Works with character show while hidden in NVL mode', function () {
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y One',
				'hide textbox',
				'show character y normal',
				'show textbox',
				'y Two'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('[data-character="y"]').should ('be.visible');
	});
});
