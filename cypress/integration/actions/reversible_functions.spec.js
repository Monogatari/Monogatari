context ('Reversible Functions', function () {

	beforeEach (() => {
		cy.open ();
	});

	it ('Continues if the function returns anything but false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Function': {
					'Apply': function () {
						return undefined;
					},
					'Reverse': function () {
						return undefined;
					}
				}},
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
				{'Function': {
					'Apply': function () {
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								resolve (true);
							}, 500);
						});
					},
					'Reverse': function () {
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								resolve (true);
							}, 500);
						});
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
	});

	it ('Continues after reverting if the function returns a promise that resolves to anything but false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Function': {
					'Apply': function () {
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								resolve (true);
							}, 500);
						});
					},
					'Reverse': function () {
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								resolve (true);
							}, 500);
						});
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		cy.get ('text-box').contains ('After');

		cy.rollback ();
		cy.wait (500);
		cy.get ('text-box').contains ('Before');

	});

	it ('Stops if the function returns false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Function': {
					'Apply': function () {
						return false;
					},
					'Reverse': function () {
						return false;
					}
				}},
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

	it ('Stops after applying if the function returns a promise that resolves to false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Function': {
					'Apply': function () {
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								resolve (false);
							}, 500);
						});
					},
					'Reverse': function () {
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								resolve (false);
							}, 500);
						});
					}
				}},
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

	it ('Stops after reverting if the function returns a promise that resolves to false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.storage ({
			step: 1
		});
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Function': {
					'Apply': function () {
						return new Promise((resolve, reject) => {
							setTimeout(() => {
								this.storage ({
									step: 2
								});
								resolve (false);
							}, 500);
						});
					},
					'Reverse': function () {
						return new Promise((resolve, reject) => {
							setTimeout(() => {
								this.storage ({
									step: 3
								});
								resolve (false);
							}, 500);
						});
					}
				}},
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
		cy.wait (500);
		cy.wrap (this.monogatari).invoke ('storage', 'step').should ('equal', 2);

		cy.rollback ();
		cy.wait (500);
		cy.get ('text-box').contains ('After');
		cy.wrap (this.monogatari).invoke ('storage', 'step').should ('equal', 3);
	});

	it ('Shows an error if anything goes wrong while executing the function', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Function': {
					'Apply': function () {
						const x = a + b;
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								resolve (true);
							}, 500);
						});
					},
					'Reverse': function () {
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								resolve (true);
							}, 500);
						});
					}
				}},
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
				{'Function': {
					'Apply': function () {
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								reject ();
							}, 500);
						});
					},
					'Reverse': function () {
						return new Promise((resolve, reject) => {
							setTimeout(function () {
								reject ();
							}, 500);
						});
					}
				}},
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