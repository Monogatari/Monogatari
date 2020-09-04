context ('Dialog', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays the character\'s name and side image correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy Hello!'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello!');
		cy.get ('[data-content="character-expression"]').should ('be.visible');
	});

	it ('Adds the dialog-footer class to the last dialog of an nvl character when the character speaking changes', function () {
		cy.loadTestAssets ({nvl: true});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy Hello!',
				'y Some other text',
				'y More text',
				'm This is a dialog',
				'm this is another dialog',
				'nvl Now the narrator'
			]
		});

		cy.start ();
		cy.wait (100);
		cy.proceed ();
		cy.wait (100);
		cy.proceed ();
		cy.wait (100);

		cy.proceed ();
		cy.wait (100);
		cy.get ('[data-spoke="y"]').last().should ('have.class', 'nvl-dialog-footer');

		cy.proceed ();
		cy.wait (100);
		cy.proceed ();
		cy.wait (100);
		cy.proceed ();
		cy.wait (100);
		cy.get ('[data-spoke="m"]').last().should ('have.class', 'nvl-dialog-footer');
	});

	it ('Restores NVL dialogs correctly when rolling back through scenes', function () {
		cy.loadTestAssets ({nvl: true});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show scene black',
				'nvl Zero',
				'nvl One',
				'nvl Two',
				'show scene red',
				'nvl Three',
				'show scene green',
				'nvl Four',
			]
		});
		cy.start ();
		cy.get ('#background').should ('have.css', 'background-color', 'rgb(0, 0, 0)');
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 0);
		cy.get ('text-box').contains ('Zero');
		cy.proceed ();
		cy.get ('text-box').contains ('Zero');
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('text-box').contains ('Zero');
		cy.get ('text-box').contains ('One');
		cy.get ('text-box').contains ('Two');
		cy.proceed ();
		cy.get ('#background').should ('have.css', 'background-color', 'rgb(255, 0, 0)');
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 1);
		cy.get ('text-box').contains ('Three');
		cy.proceed ();
		cy.get ('#background').should ('have.css', 'background-color', 'rgb(0, 128, 0)');
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 2);
		cy.get ('text-box').contains ('Four');
		cy.wait (100);
		cy.rollback ();
		cy.get ('#background').should ('have.css', 'background-color', 'rgb(255, 0, 0)');
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 1);
		cy.get ('text-box').contains ('Three');
		cy.wait (100);
		cy.rollback ();
		cy.get ('#background').should ('have.css', 'background-color', 'rgb(0, 0, 0)');
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 0);
		cy.get ('text-box').contains ('Zero');
		cy.get ('text-box').contains ('One');
		cy.get ('text-box').contains ('Two');
		cy.wait (100);
		cy.rollback ();
		cy.get ('text-box').contains ('Zero');
		cy.get ('text-box').contains ('One');
		cy.wait (100);
		cy.rollback ();
		cy.get ('text-box').contains ('Zero');
	});

	it ('Restores NVL dialogs correctly when rolling back through different textbox modes', function () {
		cy.loadTestAssets ({nvl: true});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'show scene black',
				'nvl One',
				'nvl Two',
				'Three',
				'show scene red',
				'Four',
				'show scene green',
				'nvl Five',
				'show scene black',
				'Six'
			]
		});
		cy.start ();
		cy.get ('text-box').contains ('Zero');
		cy.proceed ();
		cy.get ('#background').should ('have.css', 'background-color', 'rgb(0, 0, 0)');
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 0);
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('text-box').contains ('One');
		cy.get ('text-box').contains ('Two');
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 1);
		cy.get ('text-box').contains ('Three');
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 1);
		cy.get ('text-box').contains ('Four');
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 1);
		cy.get ('text-box').contains ('Five');
		cy.proceed ();
		cy.get ('#background').should ('have.css', 'background-color', 'rgb(0, 0, 0)');
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 2);
		cy.get ('text-box').contains ('Six');
		cy.wait (100);
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 1);
		cy.get ('text-box').contains ('Five');
		cy.wait (100);
		cy.rollback ();
		cy.get ('text-box').contains ('Four');
		cy.wait (100);
		cy.rollback ();
		// cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 2);
		cy.get ('text-box').contains ('Three');
		cy.wait (100);
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('history', 'nvl').should ('have.length', 0);
		cy.get ('text-box').contains ('One');
		cy.get ('text-box').contains ('Two');
		cy.wait (100);
		cy.rollback ();
		cy.get ('text-box').contains ('One');
		cy.wait (100);
		cy.rollback ();
		cy.get ('text-box').contains ('Zero');
	});

	it ('Restores NVL dialogs correctly when rolling back through different textbox modes', function () {
		cy.loadTestAssets ({nvl: true});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show background red',
				'Zero',
				'show scene black',
				'nvl One',
				'nvl Two',
				'show background green',
				'Three',
			]
		});
		cy.start ();
		cy.get ('text-box').contains ('Zero');
		cy.proceed ();
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('text-box').contains ('One');
		cy.get ('text-box').contains ('Two');
		cy.proceed ();
		cy.get ('text-box').contains ('Three');
		cy.wait (100);
		cy.rollback ();
		cy.wait (1500);
		cy.get ('text-box').contains ('One');
		cy.get ('text-box').contains ('Two');
		cy.wait (100);
		cy.rollback ();
		cy.wait (1500);
		cy.get ('text-box').contains ('One');
		cy.wait (100);
		cy.rollback ();
		cy.get ('text-box').contains ('Zero');
	});
});