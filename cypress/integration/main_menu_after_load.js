/* eslint-disable no-undef */

describe ('Main menu gets shown after the loading is over.', function () {
	it ('Opens the game', function () {
		cy.visit ('./dist/index.html');
	});

	it ('Registers a listener', function () {
		cy.window ().then ((win) => {
			cy.get ('main-screen').should ('be.visible');
		});
	});
});