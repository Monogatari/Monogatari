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
	this.monogatari.proceed ();
});

Cypress.Commands.add ('rollback', function () {
	this.monogatari.global ('block', false);
	this.monogatari.rollback ();
});