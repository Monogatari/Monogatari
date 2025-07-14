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

	it ('Displays the character\'s default side image correctly when an image path is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'yd1 Hello!'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello!');
		cy.get ('[data-content="character-expression"]').should ('be.visible');
	});

	it ('Displays the character\'s default side image correctly when an expression name is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'yd2 Hello!'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello!');
		cy.get ('[data-content="character-expression"]').should ('be.visible');
	});

	it ('Changes the character name color correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y Hello!',
				'm Hi!'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello!');
		cy.get ('[data-content="character-name"]').should ('have.css', 'color', 'rgb(0, 0, 255)');

		cy.proceed ();

		cy.get ('text-box').contains ('Hi!');
		cy.get ('[data-content="character-name"]').should ('have.css', 'color', 'rgb(255, 255, 255)');
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

	it ('Updates the Dialog Log Correctly', function () {
		cy.loadTestAssets ({nvl: true});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'Two',
				'Three'
			]
		});
		cy.start ();
		cy.get ('dialog-log').contains ('One');
		cy.proceed ();

		cy.get ('dialog-log').contains ('Two');
		cy.proceed ();

		cy.get ('dialog-log').contains ('Three');

		cy.rollback ();
		cy.get ('dialog-log').contains ('One');
		cy.get ('dialog-log').contains ('Two');

		cy.rollback ();
		cy.get ('dialog-log').contains ('One');

	});

	it ('Allows having defaults for the narrator character', function () {
		this.monogatari.character('_narrator', {
			nvl: true,
		});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'Two',
				'Three'
			]
		});
		cy.start ();

		cy.get ('text-box').contains ('One');
		cy.get ('text-box').should ('have.attr', 'mode', 'nvl');
	});

	it ('Applies custom classes to text-box when specified in dialog syntax', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy:custom-class Hello!',
				'm:sad:another-class|second-class Hi there!',
				'narrator:normal:special-style This is a test'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('have.class', 'custom-class');
		cy.get ('text-box').contains ('Hello!');

		cy.proceed ();
		cy.get ('text-box').should ('have.class', 'another-class');
		cy.get ('text-box').should ('have.class', 'second-class');
		cy.get ('text-box').should ('not.have.class', 'custom-class');
		cy.get ('text-box').contains ('Hi there!');

		cy.proceed ();
		cy.get ('text-box').should ('have.class', 'special-style');
		cy.get ('text-box').should ('not.have.class', 'another-class');
		cy.get ('text-box').should ('not.have.class', 'second-class');
		cy.get ('text-box').contains ('This is a test');
	});

	it ('Removes custom classes when rolling back dialogs', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy:first-class Hello!',
				'm:sad:second-class Hi there!'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('have.class', 'first-class');
		cy.get ('text-box').contains ('Hello!');

		cy.proceed ();
		cy.get ('text-box').should ('have.class', 'second-class');
		cy.get ('text-box').should ('not.have.class', 'first-class');
		cy.get ('text-box').contains ('Hi there!');

		cy.rollback ();
		cy.get ('text-box').should ('have.class', 'first-class');
		cy.get ('text-box').should ('not.have.class', 'second-class');
		cy.get ('text-box').contains ('Hello!');
	});

	it ('Applies custom classes to centered dialog', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'centered:normal:centered-style This is a centered dialog!',
				'y:happy:character-style Hello from character!'
			]
		});

		cy.start ();
		cy.get ('centered-dialog').should ('have.class', 'centered-style');
		cy.get ('centered-dialog').contains ('This is a centered dialog!');

		cy.proceed ();
		cy.get ('text-box').should ('have.class', 'character-style');
		cy.get ('text-box').should ('not.have.class', 'centered-style');
		cy.get ('text-box').contains ('Hello from character!');
	});

	it ('Applies custom classes to NVL dialog', function () {
		cy.loadTestAssets ({nvl: true});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'nvl:normal:nvl-style This is an NVL dialog!',
				'y:happy:character-style Hello from character!'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('have.class', 'nvl-style');
		cy.get ('text-box').contains ('This is an NVL dialog!');

		cy.proceed ();
		cy.get ('text-box').should ('have.class', 'character-style');
		cy.get ('text-box').should ('not.have.class', 'nvl-style');
		cy.get ('text-box').contains ('Hello from character!');
	});

	it ('Supports multiple classes with pipe separator', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy:class1|class2|class3 Multiple classes test!'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('have.class', 'class1');
		cy.get ('text-box').should ('have.class', 'class2');
		cy.get ('text-box').should ('have.class', 'class3');
		cy.get ('text-box').contains ('Multiple classes test!');
	});

	it ('Sets classes correctly after loading a save', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy:highlight Hello!',
				'm:sad:warning|urgent This is important!',
				'centered:normal:centered-style Centered message!'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('have.class', 'highlight');
		cy.get ('text-box').contains ('Hello!');

		cy.proceed ();
		cy.get ('text-box').should ('have.class', 'warning');
		cy.get ('text-box').should ('have.class', 'urgent');
		cy.get ('text-box').contains ('This is important!');

		cy.save(1).then(() => {
			cy.load(1).then(() => {
				cy.get ('text-box').should ('have.class', 'warning');
				cy.get ('text-box').should ('have.class', 'urgent');
				cy.get ('text-box').contains ('This is important!');
			});
		});
	});

	it ('Removes classes after ending the game', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy:highlight One',
				'm:sad:warning Two',
				'centered:normal:centered-style Three',
				'end'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('have.class', 'highlight');
		cy.get ('text-box').contains ('One');

		cy.proceed ();
		cy.get ('text-box').should ('have.class', 'warning');
		cy.get ('text-box').contains ('Two');

		cy.proceed ();
		cy.get ('centered-dialog').should ('have.class', 'centered-style');
		cy.get ('centered-dialog').contains ('Three');
		

		cy.proceed ();

		cy.get ('[data-component="main-menu"]').should ('be.visible');

		cy.get ('text-box').should ('not.have.class', 'highlight');
		cy.get ('text-box').should ('not.have.class', 'warning');
		cy.get ('text-box').should ('not.have.class', 'centered-style');
		cy.get ('centered-dialog').should ('not.exist');
	});

});