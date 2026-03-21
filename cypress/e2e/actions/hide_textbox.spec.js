context ('Hide TextBox', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Hides the textbox correctly', function () {
		this.monogatari.debug.level (0);
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'show image polaroid',
				'Two',
				'show textbox',
				'Three'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		cy.get ('text-box').should ('not.be.visible');
		cy.get ('text-box').contains ('Two');
		cy.get ('[data-image="polaroid"]').should ('be.visible');

		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('Three');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Updates state correctly when hidden', function () {
		this.monogatari.debug.level (0);
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', true);
		cy.get ('text-box').should ('not.be.visible');
	});

	it ('Restores textbox on rollback of hide', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'show image polaroid',
				'show textbox',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('Two');

		cy.rollback ();
		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('One');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Keeps textbox hidden through non-dialog actions', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'hide textbox',
				'show image polaroid',
				'show image christmas',
				'show textbox',
				'One'
			]
		});

		cy.start ();

		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('One');
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.get ('[data-image="christmas"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Preserves hidden state after save and load', function () {
		this.monogatari.debug.level (0);
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'Two',
				'show textbox',
				'Three'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		// Textbox should be hidden, save at this point
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', true);
		cy.get ('text-box').should ('not.be.visible');
		cy.save (1);


		cy.proceed ();
		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('Three');


		cy.proceed ();
		cy.get ('[data-component="main-menu"] [data-action="open-screen"][data-open="load"]').click ();
		cy.get ('[data-component="load-screen"] [data-component="save-slot"]').first ().click ();
		cy.get ('[data-component="game-screen"]').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', true);
		cy.get ('text-box').should ('not.be.visible');
	});

	it ('Preserves visible state after save and load when textbox was shown', function () {
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
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
		cy.save (1);

		cy.proceed ();
		cy.get ('text-box').contains ('Three');

		cy.proceed ();
		cy.get ('[data-component="main-menu"] [data-action="open-screen"][data-open="load"]').click ();
		cy.get ('[data-component="load-screen"] [data-component="save-slot"]').first ().click ();
		cy.get ('[data-component="game-screen"]').should ('be.visible');

		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
		cy.get ('text-box').should ('be.visible');
	});

	it ('Shows FancyError when dialog is shown while textbox is hidden and debug is active', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		cy.get ('.fancy-error').should ('be.visible');
	});

	it ('Does not show FancyError when debug level is NONE', function () {
		this.monogatari.debug.level (0);
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'hide textbox',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		// No FancyError should appear
		cy.get ('.fancy-error').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', true);
	});

	it ('Hides the textbox correctly in NVL mode', function () {
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y Hello!',
				'y More text',
				'hide textbox',
				'show image polaroid',
				'show textbox',
				'y Back again'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('element').invoke ('find', 'text-box').invoke ('get', 0).its ('props.mode').should ('equal', 'nvl');

		cy.proceed ();
		cy.proceed ();

		cy.get ('text-box').should ('not.be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', true);
		cy.get ('[data-image="polaroid"]').should ('be.visible');

		cy.proceed ();

		cy.get ('text-box').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
	});

	it ('Updates state correctly when hidden in NVL mode', function () {
		this.monogatari.debug.level (0);
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y One',
				'hide textbox',
				'y Two'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', false);
		cy.get ('text-box').should ('be.visible');

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('state', 'textboxHidden').should ('equal', true);
		cy.get ('text-box').should ('not.be.visible');
	});
});
