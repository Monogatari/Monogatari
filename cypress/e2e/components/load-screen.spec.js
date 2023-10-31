context ('Load Screen', function () {

	beforeEach (() => {
		cy.open ();
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


});