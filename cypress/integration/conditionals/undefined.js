/* eslint-disable no-undef */


describe ('Main menu gets shown after the loading is over.', function () {

	before (() => {
		cy.visit ('./dist/index.html');
	});

	beforeEach (() => {
		cy.window ().its('Monogatari.default').as('monogatari');
	});

	it ('Opens the game', function () {
		cy.wait(1500);
	});

	it ('Sets up a true conditional', function () {
		this.monogatari.script({
			'Start': [
				{'Conditional':{
					'Condition': function () {
						return 'SomeOtherStuff';
					},
					'SomeString': 'jump SomeString',
					'True': 'jump True',
					'False': 'jump False'
				}}
			],
			'True': [
				'True',
				'end'
			],
			'SomeString': [
				'SomeString',
				'end'
			],
			'False': [
				'False',
				'end'
			]
		});
	});

	it ('Should start the game when the button is clicked', function () {
		cy.get('main-screen').should ('be.visible');
		cy.get('[data-action="start"]').should ('be.visible');
		cy.get('[data-action="start"]').click();
		cy.wait(500);
		cy.wrap (this.monogatari).invoke('global', 'playing').should('equal', true);
	});

	it('Jumps to the False Branch', function () {
		cy.get('text-box').contains ('False');
	});

});