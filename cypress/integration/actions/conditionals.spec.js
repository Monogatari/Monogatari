context ('Conditionals', function () {

	beforeEach (() => {
		cy.visit ('./dist/index.html');
		cy.get ('main-screen').should ('be.visible');
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Runs the `True` branch when condition returns true.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': 'True',
					'False': 'False'
				}}
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('True');
	});

	it ('Runs the `False` branch when condition returns false', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script({
			'Start': [
				{'Conditional':{
					'Condition': function () {
						return false;
					},
					'SomeString': 'SomeString',
					'True': 'True',
					'False': 'False'
				}}
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('False');
	});

	it ('Runs the branch whose name was returned by the condition.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{'Conditional':{
					'Condition': function () {
						return 'SomeString';
					},
					'SomeString': 'SomeString',
					'True': 'True',
					'False': 'False'
				}}
			]
		});


		cy.start ();
		cy.get ('text-box').contains ('SomeString');
	});

	it ('Displays an error when trying to run a non existent branch.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{'Conditional':{
					'Condition': function () {
						return 'SomeStuff';
					},
					'SomeString': 'SomeString',
					'True': 'True',
					'False': 'False'
				}}
			]
		});

		cy.start ();
		cy.get ('.fancy-error').should ('be.visible');
	});

	it ('Runs the `False` branch when condition returns non boolean/string value.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{'Conditional':{
					'Condition': function () {
						return 0;
					},
					'SomeString': 'SomeString',
					'True': 'True',
					'False': 'False'
				}}
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('False');
	});

	it ('Saves the branch taken in the `conditional` history.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': 'True',
					'False': 'False'
				}}
			]
		});

		cy.start ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True']);
	});

	it ('Reverts the action (without advance) performed when rolling back.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': 'True',
					'False': 'False'
				}},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		// cy.wait(500);
		cy.get ('text-box').contains ('True');
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True']);
		// cy.wait(500);
		cy.proceed ();
		cy.get ('text-box').contains ('After');
		// cy.wait(500);
		cy.rollback ();
		cy.get ('text-box').contains ('True');
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True']);
		cy.rollback ();
		cy.get ('text-box').contains ('Before');
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('be.empty');
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True']);

	});

	it ('Reverts the action (with advance) performed when rolling back.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': 'show scene black',
					'False': 'False'
				}},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		// cy.wait(500);
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True']);
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.get ('text-box').contains ('Before');
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('be.empty');

	});

	it ('Runs nested objects without immediate advance.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': {'Conditional':{
						'Condition': function () {
							return true;
						},
						'SomeString': 'SomeString',
						'True': {'Conditional':{
							'Condition': function () {
								return true;
							},
							'SomeString': 'SomeString',
							'True': {'Conditional':{
								'Condition': function () {
									return true;
								},
								'SomeString': 'SomeString',
								'True': 'True',
								'False': 'False'
							}},
							'False': 'False'
						}},
						'False': 'False'
					}},
					'False': 'False'
				}},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		// cy.wait(500);
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True');
		// cy.wait(500);
		cy.rollback ();
		cy.get ('text-box').contains ('Before');
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('be.empty');

	});

	it ('Runs nested objects with immediate advance.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': {'Conditional':{
						'Condition': function () {
							return true;
						},
						'SomeString': 'SomeString',
						'True': {'Conditional':{
							'Condition': function () {
								return true;
							},
							'SomeString': 'SomeString',
							'True': {'Conditional':{
								'Condition': function () {
									return true;
								},
								'SomeString': 'SomeString',
								'True': 'show background black',
								'False': 'False'
							}},
							'False': 'False'
						}},
						'False': 'False'
					}},
					'False': 'False'
				}},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		// cy.wait(500);
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('After');
		// cy.wait(500);
		cy.rollback ();
		cy.get ('text-box').contains ('Before');
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('be.empty');
	});

	it ('Runs nested objects one after each other correctly.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': {'Conditional':{
						'Condition': function () {
							return true;
						},
						'SomeString': 'SomeString',
						'True': {'Conditional':{
							'Condition': function () {
								return true;
							},
							'SomeString': 'SomeString',
							'True': {'Conditional':{
								'Condition': function () {
									return true;
								},
								'SomeString': 'SomeString',
								'True': 'True',
								'False': 'False'
							}},
							'False': 'False'
						}},
						'False': 'False'
					}},
					'False': 'False'
				}},
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': {'Conditional':{
						'Condition': function () {
							return true;
						},
						'SomeString': 'SomeString',
						'True': {'Conditional':{
							'Condition': function () {
								return true;
							},
							'SomeString': 'SomeString',
							'True': {'Conditional':{
								'Condition': function () {
									return true;
								},
								'SomeString': 'SomeString',
								'True': 'True2',
								'False': 'False'
							}},
							'False': 'False'
						}},
						'False': 'False'
					}},
					'False': 'False'
				}},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		// cy.wait(500);
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True');
		// cy.wait(500);
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True2');
		// cy.wait(500);
		cy.rollback ();
		cy.get ('text-box').contains ('True');
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True2');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.rollback ();
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('be.empty');
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		// cy.wait(500);
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True');
		// cy.wait(500);
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True2');
		// cy.wait(500);
		cy.rollback ();
		cy.get ('text-box').contains ('True');
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True2');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.rollback ();
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('be.empty');

	});

	it ('Restores the state correctly after a save and load.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': {'Conditional':{
						'Condition': function () {
							return true;
						},
						'SomeString': 'SomeString',
						'True': {'Conditional':{
							'Condition': function () {
								return true;
							},
							'SomeString': 'SomeString',
							'True': {'Conditional':{
								'Condition': function () {
									return true;
								},
								'SomeString': 'SomeString',
								'True': 'True',
								'False': 'False'
							}},
							'False': 'False'
						}},
						'False': 'False'
					}},
					'False': 'False'
				}},
				{'Conditional':{
					'Condition': function () {
						return true;
					},
					'SomeString': 'SomeString',
					'True': {'Conditional':{
						'Condition': function () {
							return true;
						},
						'SomeString': 'SomeString',
						'True': {'Conditional':{
							'Condition': function () {
								return true;
							},
							'SomeString': 'SomeString',
							'True': {'Conditional':{
								'Condition': function () {
									return true;
								},
								'SomeString': 'SomeString',
								'True': 'True2',
								'False': 'False'
							}},
							'False': 'False'
						}},
						'False': 'False'
					}},
					'False': 'False'
				}},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		// cy.wait(500);
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True');
		// cy.wait(500);
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True2');
		// cy.wait(500);
		cy.rollback ();
		cy.get ('text-box').contains ('True');
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True2');
		cy.proceed ();
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.rollback ();
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('be.empty');
		cy.get ('text-box').contains ('Before');
		cy.proceed ();
		// cy.wait(500);
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True');
		// cy.wait(500);
		cy.proceed ();
		cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
		cy.get ('text-box').contains ('True2');

		cy.save(1).then(() => {
			cy.load(1).then(() => {
				this.monogatari.run (this.monogatari.label ()[this.monogatari.state ('step')]).then(() => {
					cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
					cy.get ('text-box').contains ('True2');
					cy.wait(500);

					cy.rollback ();
					cy.get ('text-box').contains ('True');
					cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
					cy.proceed ();
					cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
					cy.get ('text-box').contains ('True2');
					cy.proceed ();
					cy.get ('text-box').contains ('After');
					cy.rollback ();
					cy.rollback ();
					cy.rollback ();
					cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('be.empty');
					cy.get ('text-box').contains ('Before');
					cy.proceed ();
					// cy.wait(500);
					cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
					cy.get ('text-box').contains ('True');
					// cy.wait(500);
					cy.proceed ();
					cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
					cy.get ('text-box').contains ('True2');
					// cy.wait(500);
					cy.rollback ();
					cy.get ('text-box').contains ('True');
					cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True']);
					cy.proceed ();
					cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('deep.equal', ['True', 'True', 'True', 'True', 'True', 'True', 'True', 'True']);
					cy.get ('text-box').contains ('True2');
					cy.proceed ();
					cy.get ('text-box').contains ('After');
					cy.rollback ();
					cy.rollback ();
					cy.rollback ();
					cy.wrap (this.monogatari).invoke ('history', 'conditional').should ('be.empty');
				});

			});
		});

	});
});