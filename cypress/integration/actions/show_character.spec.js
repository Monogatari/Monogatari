context ('Show Character', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays the character correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy with fadeIn',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
		cy.get ('[data-sprite="happy"]').should('have.class', 'fadeIn');
	});

	it ('Displays the character in the right position', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy at center',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
	});

	it ('Adds the center position by default if none was provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('have.class', 'center');
		cy.get ('[data-sprite="happy"]').should ('have.data', 'position', 'center');
	});

	it ('Sets the data position property correctly when one is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy at left',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('have.class', 'left');
		cy.get ('[data-sprite="happy"]').should ('have.data', 'position', 'left');
	});

	// it ('Reuses the data position property as the position for a sprite if none is provided in a later statement', function () {
	// 	this.monogatari.setting ('TypeAnimation', false);
	// 	this.monogatari.script ({
	// 		'Start': [
	// 			'show character y happy at left',
	// 			'One',
	// 			'show character y angry with fadeIn',
	// 			'Two'
	// 		]
	// 	});

	// 	cy.start ();
	// 	cy.get ('[data-sprite="happy"]').should ('have.class', 'left');
	// 	cy.get ('[data-sprite="happy"]').should ('have.data', 'position', 'left');

	// 	cy.proceed ();

	// 	cy.get ('[data-sprite="angry"]').should ('have.class', 'left');
	// 	cy.get ('[data-sprite="angry"]').should ('have.data', 'position', 'left');
	// });

	it ('Resets the position if none is provided in a later statement', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy at left',
				'One',
				'show character y angry with fadeIn',
				'Two'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('have.class', 'left');
		cy.get ('[data-sprite="happy"]').should ('have.data', 'position', 'left');

		cy.proceed ();

		cy.get ('[data-sprite="angry"]').should ('have.class', 'center');
		cy.get ('[data-sprite="angry"]').should ('have.data', 'position', 'center');
	});

	it ('Clears the previous classes from the image correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy with fadeIn',
				'y Tada!',
				'show character y happy with rollInLeft',
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
		cy.get ('[data-sprite="happy"]').should('have.class', 'fadeIn');

		cy.proceed();
		cy.get ('[data-sprite="happy"]').should ('be.visible');
		cy.get ('[data-sprite="happy"]').should('not.have.class', 'fadeIn');
		cy.get ('[data-sprite="happy"]').should('have.class', 'rollInLeft');
	});

	it ('Engages the end-animation once the main one is over.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y normal at center with fadeIn end-fadeOut',
				'y Tada!',
				'show character y happy at center with fadeIn end-fadeOut',
				'wait 5000',
				//'show character y happy with rollInLeft',
			]
		});

		cy.start ();

		cy.get ('[data-sprite="happy"]').should ('not.be.visible');
	});

	it ('Rollbacks to the right sprite', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show image polaroid',
				'y One',
				'show character y normal at left',
				'm Two',
				'show character y angry at left with fadeIn',
				'hide image polaroid',
				'show image christmas.png center with fadeIn',
				'm Three',
				'y Four',
				'hide image christmas.png with fadeOut',
				'y Five',
				'play music theme with fade 5',
				'y Six',
				'show character y normal at left with fadeIn',
				'm Seven',
				'Eight'
			]
		});

		cy.start ();

		// Going forward
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('[data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left']);
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left']);
		cy.proceed ();
		cy.get ('[data-sprite="angry"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry at left with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character y angry at left with fadeIn']);
		cy.get ('[data-image="polaroid"]').should ('not.be.visible');
		cy.get ('[data-image="christmas.png"]').should ('be.visible');
		cy.get ('text-box').contains ('Three');
		cy.proceed ();
		cy.get ('text-box').contains ('Four');
		cy.proceed ();
		cy.get ('[data-image="christmas.png"]').should ('not.be.visible');
		cy.get ('text-box').contains ('Five');
		cy.proceed ();
		cy.get ('text-box').contains ('Six');
		cy.proceed ();
		cy.get ('[data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character y angry at left with fadeIn', 'show character y normal at left with fadeIn']);
		cy.get ('[data-sprite="angry"]').should ('not.exist');
		cy.get ('text-box').contains ('Seven');
		cy.proceed ();
		cy.get ('text-box').contains ('Eight');

		// Going backward
		cy.rollback ();
		cy.get ('text-box').contains ('Seven');
		cy.rollback ();
		cy.get ('[data-sprite="angry"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry at left with fadeIn']);
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character y angry at left with fadeIn']);
		cy.get ('[data-sprite="normal"]').should ('not.be.visible');
		cy.get ('text-box').contains ('Six');
		cy.rollback ();
		cy.get ('text-box').contains ('Five');
		cy.rollback ();
		cy.get ('[data-image="christmas.png"]').should ('be.visible');
		cy.get ('text-box').contains ('Four');
		cy.rollback ();
		cy.get ('text-box').contains ('Three');
		cy.rollback ();
		cy.get ('[data-sprite="angry"]').should ('not.be.visible');
		cy.get ('[data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left']);
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left']);
		cy.get ('[data-image="polaroid"]').should ('be.visible');
		cy.get ('[data-image="christmas.png"]').should ('not.be.visible');
		cy.get ('text-box').contains ('Two');
		cy.rollback ();
		cy.get ('[data-sprite="normal"]').should ('not.be.visible');
		cy.get ('text-box').contains ('One');
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('be.empty');
	});

	it ('Updates the sprite corectly on consecutive show statements', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y happy with fadeIn',
				'show character y angry with fadeIn',
				'y Tada!'
			]
		});

		cy.start ();
		cy.get ('[data-sprite="happy"]').should ('not.be.visible');
		cy.get ('[data-sprite="angry"]').should ('be.visible');
		cy.get ('[data-sprite="angry"]').should('have.class', 'fadeIn');
	});

	it ('Doesn\'t duplicate sprites on consecutive end animations', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y normal at left with end-fadeOut',
				'y Tada!',
				'show character y happy at left with fadeIn end-fadeOut',
				'y Tada!',
				//'show character y happy with rollInLeft',
			]
		});

		cy.start ();
		cy.get ('[data-sprite="normal"]').should ('be.visible');
		cy.proceed();
		cy.get ('[data-sprite="normal"]').should ('not.be.visible');
		cy.get ('[data-sprite="happy"]').should ('be.visible');
	});

	it ('Displays and rolls back to the right sprite when multiple are present', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y normal at left',
				'show character m normal at right',
				'y One',
				'show character m angry at right',
				'm Two',
				'show character y angry at left',
				'y Three'
			]
		});

		cy.start ();

		// Going forward
		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right', 'show character m angry at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m angry at right']);
		cy.get ('text-box').contains ('Two');
		cy.proceed ();
		cy.get ('[data-character="y"][data-sprite="angry"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right', 'show character m angry at right', 'show character y angry at left']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character m angry at right', 'show character y angry at left']);
		cy.get ('text-box').contains ('Three');
		cy.rollback ();
		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="angry"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right', 'show character m angry at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character m angry at right', 'show character y normal at left']);
		cy.get ('text-box').contains ('Two');
		cy.rollback ();
		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.get ('text-box').contains ('One');
	});

	it ('Restores state after load correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y normal at left',
				'show character m normal at right',
				'y One',
				'end'
			]
		});

		cy.start ();

		// Going forward
		cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
		cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
		cy.get ('text-box').contains ('One');
		cy.save(1).then(() => {
			cy.proceed ();
			cy.get('main-screen').should ('be.visible');
			cy.wrap (this.monogatari).invoke ('history', 'character').should ('be.empty');
			cy.wrap (this.monogatari).invoke ('state', 'characters').should ('be.empty');
			cy.load(1).then(() => {
				cy.get('main-screen').should ('not.be.visible');
				cy.get('game-screen').should ('be.visible');
				cy.get ('[data-character="y"][data-sprite="normal"]').should ('be.visible');
				cy.get ('[data-character="m"][data-sprite="normal"]').should ('be.visible');
				cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
				cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y normal at left', 'show character m normal at right']);
				cy.get ('text-box').contains ('One');
			});
		});
	});
});
