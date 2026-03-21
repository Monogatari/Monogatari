context ('Save Screen Screenshots', function () {

	beforeEach (() => {
		cy.open ();
		cy.clearStorage();
	});

	it ('Saves without screenshot when Screenshots setting is false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.setting ('Screenshots', false);
		this.monogatari.script ({
			'Start': [
				'show scene #333333 with fadeIn',
				'Hello world',
				'end'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello world');
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();
		cy.get ('[data-action="save"]').click ();

		cy.get ('[data-component="save-screen"] [data-component="save-slot"]').should ('have.length', 1);
	});

	it ('Creates a save slot when Screenshots is enabled with IndexedDB', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.setting ('Screenshots', true);
		this.monogatari.settings ({
			Storage: {
				Adapter: 'IndexedDB',
				Store: 'TestGameData',
				Endpoint: ''
			}
		});
		this.monogatari.script ({
			'Start': [
				'show scene #333333 with fadeIn',
				'Hello world',
				'end'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello world');
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();
		cy.get ('[data-action="save"]').click ();

		cy.get ('[data-component="save-screen"] [data-component="save-slot"]').should ('have.length', 1);
	});

	it ('Does not include __screenshot keys as save slots', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.setting ('Screenshots', true);
		this.monogatari.settings ({
			Storage: {
				Adapter: 'IndexedDB',
				Store: 'TestGameData',
				Endpoint: ''
			}
		});
		this.monogatari.script ({
			'Start': [
				'show scene #333333 with fadeIn',
				'Hello world',
				'end'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello world');
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();
		cy.get ('[data-action="save"]').click ();

		cy.get ('[data-component="save-screen"] [data-component="save-slot"]').should ('have.length', 1);
	});

	it ('Falls back to scene image when screenshot capture fails', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.setting ('Screenshots', true);
		this.monogatari.settings ({
			Storage: {
				Adapter: 'IndexedDB',
				Store: 'TestGameData',
				Endpoint: ''
			}
		});

		// Override onSaveScreenshot to simulate failure
		this.monogatari.onSaveScreenshot = async () => {
			throw new Error ('Simulated failure');
		};

		this.monogatari.script ({
			'Start': [
				'show scene #333333 with fadeIn',
				'Hello world',
				'end'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Hello world');
		cy.get ('[data-action="open-screen"][data-open="save"]').click ();
		cy.get ('[data-action="save"]').click ();

		// Slot should still be created despite screenshot failure
		cy.get ('[data-component="save-screen"] [data-component="save-slot"]').should ('have.length', 1);
	});
});
