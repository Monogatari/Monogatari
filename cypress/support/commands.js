// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add ('open', () => {
	cy.visit ('./dist/index.html');
	cy.window ().its ('Monogatari.default').as ('monogatari');
});

Cypress.Commands.add ('start', function () {
	// this.monogatari.runListener ('start');
	cy.get ('[data-action="start"]').click ();
});

Cypress.Commands.add ('proceed',function () {
	this.monogatari.proceed ({ userInitiated: true, skip: false, autoPlay: false });
});

Cypress.Commands.add ('rollback', function () {
	this.monogatari.global ('block', false);
	this.monogatari.rollback ();
});

Cypress.Commands.add ('loadTestAssets', function (args) {
	const { nvl } = Object.assign ({
		nvl: false
	}, args);

	this.monogatari.settings ({
		'AssetsPath': {
			root: 'https://datadyne.perfectdark.space/monogatari/assets'
		}
	});

	this.monogatari.assets ('videos', {
		'dandelion': 'dandelion.mp4'
	});

	this.monogatari.characters ({
		'y': {
			name: 'Yui',
			directory: 'yui',
			sprites: {
				angry: 'angry.png',
				happy: 'happy.png',
				normal: 'normal.png',
				sad: 'sad.png',
				surprised: 'surprised.png',
			},
			expressions: {
				angry: 'expressions/angry.png',
				happy: 'expressions/happy.png',
				normal: 'expressions/normal.png',
				sad: 'expressions/sad.png',
				surprised: 'expressions/surprised.png',
			},
			nvl
		},
		'm': {
			name: 'Mio',
			directory: 'mio',
			sprites: {
				angry: 'angry.png',
				happy: 'happy.png',
				normal: 'normal.png',
				sad: 'sad.png',
				surprised: 'surprised.png',
			},
			expressions: {
				angry: 'expressions/angry.png',
				happy: 'expressions/happy.png',
				normal: 'expressions/normal.png',
				sad: 'expressions/sad.png',
				surprised: 'expressions/surprised.png',
			},
			nvl
		}
	});
});

Cypress.Commands.add ('save', function (slot) {
	return this.monogatari.saveTo ('SaveLabel', slot);
});

Cypress.Commands.add ('load', function (slot) {
	return this.monogatari.loadFromSlot ('Save_' + slot);
});