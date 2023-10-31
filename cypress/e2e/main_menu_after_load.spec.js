/* eslint-disable no-undef */

describe ('Main menu gets shown after the loading is over.', function () {

	before (() => {
		cy.visit ('./dist/index.html');
	});

	it ('Opens the game', function () {
		cy.wait(2500);
		cy.get('main-screen').should ('be.visible');
	});
});