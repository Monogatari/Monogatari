context ('Dialog', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays narrator dialog correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'This is a narrator dialog',
				'Another line'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('This is a narrator dialog');
		cy.get ('[data-content="character-name"]').should ('be.empty');
		cy.get ('[data-content="character-expression"]').should ('not.be.visible');

		cy.proceed ();
		cy.get ('text-box').contains ('Another line');
	});

	it ('Displays centered dialog correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'centered This is centered',
				'Normal dialog'
			]
		});

		cy.start ();
		cy.get ('centered-dialog').should ('exist');
		cy.get ('centered-dialog').contains ('This is centered');
		cy.get ('text-box').should ('not.be.visible');

		cy.proceed ();
		cy.get ('centered-dialog').should ('not.exist');
		cy.get ('text-box').should ('be.visible');
		cy.get ('text-box').contains ('Normal dialog');
	});

	it ('Removes centered dialog on rollback', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'First dialog',
				'centered This is centered',
				'Third dialog'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('First dialog');

		cy.proceed ();
		cy.get ('centered-dialog').should ('exist');
		cy.get ('centered-dialog').contains ('This is centered');

		cy.rollback ();
		cy.get ('centered-dialog').should ('not.exist');
		cy.get ('text-box').contains ('First dialog');
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
				'm:sad:another-class|second-class Hi there!'
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

	it ('Types dialog character by character when TypeAnimation is enabled', function () {
		this.monogatari.setting ('TypeAnimation', true);
		this.monogatari.setting ('TypeAnimationSpeed', 50);
		this.monogatari.script ({
			'Start': [
				'Hello World!'
			]
		});

		cy.start ();
		// Initially, not all characters should be visible
		cy.get ('type-writer').should ('exist');
		// Wait for animation to complete
		cy.wait (700);
		cy.get ('text-box').contains ('Hello World!');
	});

	it ('Stops typing and shows full text when clicking during animation', function () {
		this.monogatari.setting ('TypeAnimation', true);
		this.monogatari.setting ('TypeAnimationSpeed', 100);
		this.monogatari.script ({
			'Start': [
				'This is a very long dialog that would take a while to type out completely.',
				'Second dialog'
			]
		});

		cy.start ();
		cy.get ('type-writer').should ('exist');
		// Click to skip animation
		cy.wait (200);
		cy.proceed ();
		// Full text should now be visible
		cy.get ('text-box').contains ('This is a very long dialog that would take a while to type out completely.');

		// Next proceed should advance to next dialog
		cy.proceed ();
		cy.get ('text-box').contains ('Second dialog');
	});

	it ('Handles special characters in dialog correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'"Hello!" said the character.',
				'Special chars: <>&\'',
				'Unicode: こんにちは 你好 مرحبا'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('"Hello!" said the character.');

		cy.proceed ();
		cy.get ('text-box').contains ('Special chars:');

		cy.proceed ();
		cy.get ('text-box').contains ('Unicode: こんにちは 你好 مرحبا');
	});

	it ('Shows character expression side image correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y:happy Yui is happy!',
				'y:sad Now Yui is sad.'
			]
		});

		cy.start ();
		cy.get ('[data-content="character-expression"]').should ('be.visible');
		cy.get ('text-box').contains ('Yui is happy!');

		cy.proceed ();
		cy.get ('[data-content="character-expression"]').should ('be.visible');
		cy.get ('text-box').contains ('Now Yui is sad.');
	});

	it ('Handles dialog without expression gracefully', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y Hello without expression!',
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello without expression!');
	});

	it ('Updates finished_typing global correctly with animation', function () {
		this.monogatari.setting ('TypeAnimation', true);
		this.monogatari.setting ('TypeAnimationSpeed', 25);
		this.monogatari.script ({
			'Start': [
				'Hi',
				'Done'
			]
		});

		cy.start ();
		// Check that finished_typing is eventually true after animation
		cy.wait (200);
		cy.wrap (this.monogatari).invoke ('global', 'finished_typing').should ('eq', true);

		cy.proceed ();
		cy.get ('text-box').contains ('Done');
	});

	it ('Updates finished_typing global correctly without animation', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Instant text',
				'Done'
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('global', 'finished_typing').should ('eq', true);
		cy.get ('text-box').contains ('Instant text');
	});

	it ('Handles text-box modes correctly', function () {
		cy.loadTestAssets ({nvl: true});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Normal ADV mode',
				'nvl This is NVL mode',
				'centered This is centered',
				'Back to normal'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('have.attr', 'mode', 'adv');
		cy.get ('text-box').contains ('Normal ADV mode');

		cy.proceed ();
		cy.get ('text-box').should ('have.attr', 'mode', 'nvl');
		cy.get ('text-box').contains ('This is NVL mode');

		cy.proceed ();
		cy.get ('centered-dialog').should ('exist');

		cy.proceed ();
		cy.get ('text-box').should ('have.attr', 'mode', 'adv');
		cy.get ('text-box').contains ('Back to normal');
	});

	it ('Clears NVL text when switching to ADV mode', function () {
		cy.loadTestAssets ({nvl: true});
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'nvl First NVL line',
				'nvl Second NVL line',
				'This is ADV mode now'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('have.attr', 'mode', 'nvl');
		cy.get ('text-box').contains ('First NVL line');

		cy.proceed ();
		cy.get ('text-box').contains ('First NVL line');
		cy.get ('text-box').contains ('Second NVL line');

		cy.proceed ();
		cy.get ('text-box').should ('have.attr', 'mode', 'adv');
		cy.get ('text-box').contains ('This is ADV mode now');
		cy.get ('text-box').should ('not.contain', 'First NVL line');
	});

	it ('Handles voice playback with dialog', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'play voice sample',
				'y Hello with voice!',
				'y Next line stops voice'
			]
		});

		cy.start ();
		cy.proceed ();
		cy.get ('text-box').contains ('Hello with voice!');

		cy.proceed ();
		cy.get ('text-box').contains ('Next line stops voice');
	});

	it ('Handles long dialogs with scrolling', function () {
		this.monogatari.setting ('TypeAnimation', false);
		const longText = 'This is a very long dialog. '.repeat (20);
		this.monogatari.script ({
			'Start': [
				longText
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('This is a very long dialog.');
	});

	it ('Preserves dialog entries in dialog log component', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y First message',
				'm Second message',
				'Third message'
			]
		});

		cy.start ();
		cy.get ('dialog-log [data-spoke]').should ('have.length', 1);

		cy.proceed ();
		cy.get ('dialog-log [data-spoke]').should ('have.length', 2);

		cy.proceed ();
		cy.get ('dialog-log [data-spoke]').should ('have.length', 3);

		cy.rollback ();
		cy.get ('dialog-log [data-spoke]').should ('have.length', 2);
	});

	it ('Correctly identifies when dialog is from same character', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y Hello!',
				'y Still talking',
				'm Different character'
			]
		});

		cy.start ();
		cy.get ('[data-content="character-name"]').contains ('Yui');

		cy.proceed ();
		cy.get ('[data-content="character-name"]').contains ('Yui');

		cy.proceed ();
		cy.get ('[data-content="character-name"]').contains ('Mio');
	});

	it ('Handles inline actions in dialog text', function () {
		this.monogatari.setting ('TypeAnimation', true);
		this.monogatari.setting ('TypeAnimationSpeed', 25);
		this.monogatari.script ({
			'Start': [
				'Hello {pause:100} World!'
			]
		});

		cy.start ();
		cy.wait (500);
		cy.get ('text-box').contains ('Hello');
		cy.get ('text-box').contains ('World!');
	});

	it ('Handles speed changes in dialog text', function () {
		this.monogatari.setting ('TypeAnimation', true);
		this.monogatari.setting ('TypeAnimationSpeed', 25);
		this.monogatari.script ({
			'Start': [
				'Fast{speed:200}...slow{speed:25}...fast again!'
			]
		});

		cy.start ();
		cy.wait (1000);
		cy.get ('text-box').contains ('Fast');
		cy.get ('text-box').contains ('slow');
		cy.get ('text-box').contains ('fast again!');
	});

	// =========================================================================
	// Text Effect Tests
	// =========================================================================

	describe ('Text Effects', function () {

		it ('Applies shake effect to characters', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'Hello {shake}shaking{/shake} world!'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('text-box').contains ('Hello');
			cy.get ('text-box').contains ('shaking');
			cy.get ('text-box').contains ('world!');
			// Check that shake effect data attribute is applied
			cy.get ('type-character[data-effect-shake]').should ('have.length.at.least', 1);
		});

		it ('Applies wave effect to characters', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'This is {wave}wavy text{/wave}!'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('text-box').contains ('wavy text');
			cy.get ('type-character[data-effect-wave]').should ('have.length.at.least', 1);
		});

		it ('Applies glitch effect to characters', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'A {glitch}corrupted{/glitch} message'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('text-box').contains ('corrupted');
			cy.get ('type-character[data-effect-glitch]').should ('have.length.at.least', 1);
		});

		it ('Applies emotion preset effects', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'{angry}I AM FURIOUS!{/angry}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('text-box').contains ('I AM FURIOUS!');
			cy.get ('type-character[data-effect-angry]').should ('have.length.at.least', 1);
		});

		it ('Applies emphasis effects (bold, italic, big)', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'This is {bold}important{/bold} and {italic}emphasized{/italic}!'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('text-box').contains ('important');
			cy.get ('text-box').contains ('emphasized');
			cy.get ('type-character[data-effect-bold]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-italic]').should ('have.length.at.least', 1);
		});

		it ('Applies reveal style effects', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'The {redacted}CLASSIFIED{/redacted} information'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('text-box').contains ('CLASSIFIED');
			cy.get ('type-character[data-effect-redacted]').should ('have.length.at.least', 1);
		});

		it ('Supports multiple effects on different parts of text', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'{shake}Scary{/shake} and {happy}joyful{/happy}!'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('text-box').contains ('Scary');
			cy.get ('text-box').contains ('joyful');
			cy.get ('type-character[data-effect-shake]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-happy]').should ('have.length.at.least', 1);
		});

		it ('Strips effect markers when TypeAnimation is disabled', function () {
			this.monogatari.setting ('TypeAnimation', false);
			this.monogatari.script ({
				'Start': [
					'Hello {shake}world{/shake}!'
				]
			});

			cy.start ();
			cy.get ('text-box').contains ('Hello world!');
			// Effect markers should not appear in text
			cy.get ('text-box').should ('not.contain', '{/shake}');
			cy.get ('text-box').should ('not.contain', '{/');
		});

		it ('Strips multiple effect markers when TypeAnimation is disabled', function () {
			this.monogatari.setting ('TypeAnimation', false);
			this.monogatari.script ({
				'Start': [
					'{angry}FURIOUS{/angry} and {wave}wavy{/wave} and {glitch}glitchy{/glitch}!'
				]
			});

			cy.start ();
			cy.get ('text-box').contains ('FURIOUS and wavy and glitchy!');
			cy.get ('text-box').should ('not.contain', '{/angry}');
			cy.get ('text-box').should ('not.contain', '{/wave}');
			cy.get ('text-box').should ('not.contain', '{/glitch}');
		});

		it ('Combines effects with pause and speed actions', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'Hello{pause:50} {shake}shaking{/shake}{speed:50}...done!'
				]
			});

			cy.start ();
			cy.wait (800);
			cy.get ('text-box').contains ('Hello');
			cy.get ('text-box').contains ('shaking');
			cy.get ('text-box').contains ('done!');
			cy.get ('type-character[data-effect-shake]').should ('have.length.at.least', 1);
		});

		it ('Applies effects in centered dialog', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('CenteredTypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'centered {mysterious}A mysterious message{/mysterious}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('centered-dialog').should ('exist');
			cy.get ('centered-dialog').contains ('A mysterious message');
			cy.get ('centered-dialog type-character[data-effect-mysterious]').should ('have.length.at.least', 1);
		});

		it ('Applies effects in NVL mode', function () {
			cy.loadTestAssets ({nvl: true});
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('NVLTypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'nvl {scared}Trembling with fear{/scared}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('text-box').contains ('Trembling with fear');
			cy.get ('type-character[data-effect-scared]').should ('have.length.at.least', 1);
		});

		it ('Handles all shake variants', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'{shake-hard}HARD{/shake-hard} {shake-slow}slow{/shake-slow} {shake-little}little{/shake-little}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('type-character[data-effect-shake-hard]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-shake-slow]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-shake-little]').should ('have.length.at.least', 1);
		});

		it ('Handles all wave variants', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'{wave-slow}slow{/wave-slow} {wave-fast}fast{/wave-fast}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('type-character[data-effect-wave-slow]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-wave-fast]').should ('have.length.at.least', 1);
		});

		it ('Handles all glitch variants', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'{glitch-hard}HARD{/glitch-hard} {glitch-slow}slow{/glitch-slow}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('type-character[data-effect-glitch-hard]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-glitch-slow]').should ('have.length.at.least', 1);
		});

		it ('Handles fade and scale reveal effects', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'{fade}fading{/fade} {scale}scaling{/scale} {blur}blurry{/blur}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('type-character[data-effect-fade]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-scale]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-blur]').should ('have.length.at.least', 1);
		});

		it ('Handles color effects', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'{rainbow}colorful{/rainbow} {glow}glowing{/glow}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('type-character[data-effect-rainbow]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-glow]').should ('have.length.at.least', 1);
		});

		it ('Handles all emotion presets', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 5);
			this.monogatari.script ({
				'Start': [
					'{happy}joy{/happy} {sad}tears{/sad} {excited}wow{/excited} {whisper}shh{/whisper}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('type-character[data-effect-happy]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-sad]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-excited]').should ('have.length.at.least', 1);
			cy.get ('type-character[data-effect-whisper]').should ('have.length.at.least', 1);
		});

		it ('Sets char-index CSS variable for staggered animations', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'{wave}Hello{/wave}'
				]
			});

			cy.start ();
			cy.wait (500);
			// Check that characters have --char-index CSS variable set
			cy.get ('type-character[data-effect-wave]').first ().should (($el) => {
				const style = $el[0].style;
				expect (style.getPropertyValue ('--char-index')).to.not.be.empty;
			});
		});

		it ('Effects work with character dialog', function () {
			this.monogatari.setting ('TypeAnimation', true);
			this.monogatari.setting ('TypeAnimationSpeed', 10);
			this.monogatari.script ({
				'Start': [
					'y:happy {excited}I am so happy!{/excited}'
				]
			});

			cy.start ();
			cy.wait (500);
			cy.get ('[data-content="character-name"]').contains ('Yui');
			cy.get ('text-box').contains ('I am so happy!');
			cy.get ('type-character[data-effect-excited]').should ('have.length.at.least', 1);
		});

		it ('Strips all effect types when animation disabled', function () {
			this.monogatari.setting ('TypeAnimation', false);
			this.monogatari.script ({
				'Start': [
					'{shake}a{/shake}{wave}b{/wave}{glitch}c{/glitch}{bold}d{/bold}{angry}e{/angry}{redacted}f{/redacted}{pause:100}{speed:50}g'
				]
			});

			cy.start ();
			cy.get ('text-box').contains ('abcdefg');
			cy.get ('text-box').should ('not.contain', '{/');
			cy.get ('text-box').should ('not.contain', '{pause');
			cy.get ('text-box').should ('not.contain', '{speed');
		});

	});

});