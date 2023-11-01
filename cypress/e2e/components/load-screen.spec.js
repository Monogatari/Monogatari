context ('Load Screen', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Gets open when clicking the load button on the main menu', function () {
		cy.get ('[data-component="main-menu"] [data-action="open-screen"][data-open="load"]').click ();

		cy.get ('[data-component="load-screen"]').should ('be.visible');
	});

	it ('Displays the no saved games message if it\'s empty', function () {
		cy.get ('[data-component="main-menu"] [data-action="open-screen"][data-open="load"]').click ();

		cy.get ('[data-component="load-screen"] p').contains ('No saved games');
	});

	it ('Displays the previously saved slots', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'After',
				'end'
			]
		});

		cy.start ();

		cy.save (1).then (() => {
			cy.get ('[data-component="quick-menu"] [data-action="open-screen"][data-open="load"]').click ();

			cy.get ('[data-component="load-screen"] [data-component="save-slot"]').should ('have.length', 1);
		});
	});

	it ('Loads a game when a slot is pressed', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'After',
				'end'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');

		cy.save (1);

		cy.proceed ();
		cy.get ('text-box').contains ('After');
		cy.save (2);

		cy.proceed ();

		cy.get ('[data-component="main-menu"] [data-action="open-screen"][data-open="load"]').click ();
		cy.get ('[data-component="load-screen"] [data-component="save-slot"]').should ('have.length', 2);
		cy.get ('[data-component="load-screen"] [data-component="save-slot"]').first ().click ();

		cy.get ('[data-component="game-screen"]').should ('be.visible');
		cy.get ('text-box').contains ('Before');

		cy.proceed ();
		cy.proceed ();


		cy.get ('[data-component="main-menu"] [data-action="open-screen"][data-open="load"]').click ();
		cy.get ('[data-component="load-screen"]').should ('be.visible');
		cy.get ('[data-component="load-screen"] [data-component="save-slot"]').last ().click ();
		cy.get ('[data-component="game-screen"]').should ('be.visible');
		cy.get ('text-box').contains ('After');
	});

	it ('Gives priority to the last known background', function () {
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
		cy.get ('[data-component="load-screen"] [data-component="save-slot"] [data-content="background"]').last ().should ('have.css', 'background-image', 'url("https://datadyne.perfectdark.space/monogatari/assets/images/christmas.png")');
	});

});