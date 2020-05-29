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
});