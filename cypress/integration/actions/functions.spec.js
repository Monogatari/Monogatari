context ('Functions', function () {

	beforeEach (() => {
		cy.open ();
	});

	it ('Continues if the function returns anything but false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				function () {
					return undefined;
				},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
	});

	it ('Continues if the function returns a promise that resolves to anything but false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				function () {
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							resolve (true);
						}, 500);
					});
				},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
	});

	it ('Stops if the function returns false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				function () {
					return false;
				},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');

		cy.proceed ();

		cy.wait(100);
		cy.get ('text-box').contains ('Before');

		cy.proceed ();
		cy.get ('text-box').contains ('After');
	});

	it ('Stops if the function returns a promise that resolves to false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				function () {
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							resolve (false);
						}, 500);
					});
				},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');

		cy.proceed ();

		cy.wait (600);
		cy.get ('text-box').contains ('Before');

		cy.proceed ();
		cy.get ('text-box').contains ('After');
	});

	it ('Does not rollback', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				function () {
					return undefined;
				},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.wait (100);
		cy.get ('text-box').contains ('After');
	});

	it ('Shows an error if anything goes wrong while executing the function', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				function () {
					const x = a + b;
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							resolve (true);
						}, 500);
					});
				},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');

		cy.proceed ();

		cy.get ('.fancy-error').should ('be.visible');
	});

	it ('Shows an error if it returns a rejected promise', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				function () {
					return new Promise((resolve, reject) => {
						setTimeout(function () {
							reject ();
						}, 500);
					});
				},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');

		cy.proceed ();
		cy.wait (500);

		cy.get ('.fancy-error').should ('be.visible');
	});
});