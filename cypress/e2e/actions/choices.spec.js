const choice =


context ('Choices', function () {

	beforeEach (() => {
		cy.open ().then(function () {
			this.monogatari.$ ('choice', {'Choice':{
				'Dialog': 'This is a choice',
				'One': {
					'Text': 'One',
					'Do': 'One'
				},
				'Two': {
					'Text': 'Two',
					'Do': 'Two'
				},
				'Three': {
					'Text': 'Three',
					'Do': 'Three'
				},
				'Disabled': {
					'Text': 'Disabled',
					'Do': 'Disabled',
					'Clickable': function () {
						return false;
					}
				},
				'Hidden': {
					'Text': 'Hidden',
					'Do': 'Hidden',
					'Condition': function () {
						return false;
					}
				},
				'OnClick': {
					'Text': 'On Click',
					'Do': 'On Click',
					'onClick': function () {
						this.storage ('clicked', true);
					}
				},
				'OnChosen': {
					'Text': 'On Chosen',
					'Do': 'On Chosen',
					'onChosen': function () {
						this.storage ({ clicked: true });
					}
				}
			}});
		});

	});

	it ('Displays dialog when one is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'$ choice',
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('text-box').contains ('This is a choice');
	});

	it ('Doesn\'t display choices whose `Condition` function returned false.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'$ choice',
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="Hidden"]').should ('not.exist');
	});

	it ('Shows choices whose `Clickable` function returned false as disabled.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'$ choice',
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="Disabled"]').should ('be.disabled');
	});

	it ('Disappears after a choice is chosen.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'$ choice',
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="Two"]').click ();
		cy.get ('choice-container').should ('not.exist');
	});

	it ('Runs the `Do` action on a choice when it\'s clicked.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'$ choice',
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="Two"]').click ();
		cy.get ('text-box').contains ('Two');
	});

	it ('Runs the onChosen function on a choice when it is clicked.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'$ choice',
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="OnChosen"]').click ();
		cy.wrap (this.monogatari).invoke ('storage', 'clicked').should ('equal', true);

	});

	it ('Saves the selected choice on the `choice` history.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'$ choice',
				'After'
			]
		});

		cy.start ();

		cy.get ('text-box').contains ('Before');

		cy.proceed ();

		cy.get ('choice-container').should ('be.visible');
		cy.get ('text-box').contains ('This is a choice');
		cy.wait (150);
		cy.get ('[data-choice="One"]').click ();
		cy.get ('text-box').contains ('One');
		cy.wait (150);

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One']);
		cy.get ('text-box').contains ('After');

		cy.rollback ();

		cy.get ('choice-container').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('be.empty');

		cy.rollback ();

		cy.get ('choice-container').should ('not.exist');
		cy.get ('text-box').contains ('Before');
	});

	it ('Handles consecutive statements correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				'$ choice',
				'$ choice',
				'$ choice',
				'After'
			]
		});

		cy.start ();

		cy.get ('text-box').contains ('Before');

		cy.proceed ();

		cy.get ('choice-container').should ('be.visible');
		cy.get ('text-box').contains ('This is a choice');
		cy.wait (150);
		cy.get ('[data-choice="One"]').click ();
		cy.get ('text-box').contains ('One');
		cy.wait (150);

		cy.proceed ();

		cy.get ('choice-container').should ('be.visible');
		cy.get ('text-box').contains ('This is a choice');
		cy.wait (150);
		cy.get ('[data-choice="Two"]').click ();
		cy.get ('text-box').contains ('Two');
		cy.wait (150);

		cy.proceed ();

		cy.get ('choice-container').should ('be.visible');
		cy.get ('text-box').contains ('This is a choice');
		cy.wait (150);
		cy.get ('[data-choice="Three"]').click ();
		cy.get ('text-box').contains ('Three');
		cy.wait (150);

		cy.proceed ();

		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One', 'Two', 'Three']);
		cy.get ('text-box').contains ('After');

		cy.rollback ();

		cy.get ('choice-container').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One', 'Two']);

		cy.rollback ();

		cy.get ('choice-container').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One']);

		cy.rollback ();

		cy.get ('choice-container').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', []);

		cy.rollback ();

		cy.get ('choice-container').should ('not.exist');
		cy.get ('text-box').contains ('Before');
	});

	it ('Displays timer when one is provided', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': 'One'
					},
					'Timer': {
						// Time in milliseconds
						time: 5000,
						// The function to run when the time is over
						callback: () => {
							// Get all choices being shown and that are not disabled
							// const choices = window.monogatari.element ().find ('[data-choice]:not([disabled])');

							// // Pick one of those options randomly
							// const random = choices.get (window.monogatari.random (0, choices.length - 1));

							// // Fake a click on it
							// random.click ();

							// Promise friendly!
							return Promise.resolve ();
						}
					},
				}},
				'After'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Before');
		cy.wrap (this.monogatari).invoke ('global', '_ChoiceTimer').should ('have.length', 0);
		cy.proceed ();
		cy.get ('text-box').contains ('This is a choice');
		cy.get ('timer-display').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('global', '_ChoiceTimer').should ('have.length', 1);
		cy.wrap (this.monogatari).invoke ('global', '_choice_pending_rollback').should ('have.length', 1);
		cy.wrap (this.monogatari).invoke ('global', '_choice_just_rolled_back').should ('have.length', 0);

		cy.get ('[data-choice="One"]').click ();

		cy.wait (150);
		cy.wrap (this.monogatari).invoke ('global', '_choice_pending_rollback').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('global', '_choice_just_rolled_back').should ('have.length', 0);
		cy.get ('timer-display').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('global', '_ChoiceTimer').should ('have.length', 0);
		cy.get ('text-box').contains ('One');
		cy.proceed ();

		cy.get ('text-box').contains ('After');

		cy.rollback ();
		cy.get ('text-box').contains ('This is a choice');
		cy.get ('timer-display').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('global', '_choice_pending_rollback').should ('have.length', 1);
		cy.wrap (this.monogatari).invoke ('global', '_choice_just_rolled_back').should ('have.length', 0);
		cy.wrap (this.monogatari).invoke ('global', '_ChoiceTimer').should ('have.length', 1);

		cy.get ('text-box').contains ('This is a choice');
		cy.get ('timer-display').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('global', '_ChoiceTimer').should ('have.length', 1);
		cy.wrap (this.monogatari).invoke ('global', '_choice_pending_rollback').should ('have.length', 1);
		cy.wrap (this.monogatari).invoke ('global', '_choice_just_rolled_back').should ('have.length', 0);

		cy.get ('[data-choice="One"]').click ();

		cy.wait (150);
		cy.wrap (this.monogatari).invoke ('global', '_choice_pending_rollback').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('global', '_choice_just_rolled_back').should ('have.length', 0);
		cy.get ('timer-display').should ('not.exist');
		cy.wrap (this.monogatari).invoke ('global', '_ChoiceTimer').should ('have.length', 0);
		cy.get ('text-box').contains ('One');
		cy.proceed ();
		cy.get ('text-box').contains ('After');

		cy.rollback ();
		cy.get ('text-box').contains ('This is a choice');
		cy.get ('timer-display').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('global', '_choice_pending_rollback').should ('have.length', 1);
		cy.wrap (this.monogatari).invoke ('global', '_choice_just_rolled_back').should ('have.length', 0);
		cy.wrap (this.monogatari).invoke ('global', '_ChoiceTimer').should ('have.length', 1);


		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('global', '_choice_pending_rollback').should ('be.empty');
		cy.wrap (this.monogatari).invoke ('global', '_choice_just_rolled_back').should ('have.length', 0);
		cy.get ('text-box').contains ('Before');
		cy.wrap (this.monogatari).invoke ('global', '_ChoiceTimer').should ('have.length', 0);
	});

	// it ('Supports nested statements.', function () {
	// 	this.monogatari.setting ('TypeAnimation', false);
	// 	this.monogatari.script ({
	// 		'Start': [
	// 			'Before',
	// 			{'Choice':{
	// 				'Dialog': 'This is a choice',
	// 				'One': {
	// 					'Text': 'One',
	// 					'Do': {'Choice':{
	// 						'Dialog': 'This is a choice 2',
	// 						'One': {
	// 							'Text': 'One',
	// 							'Do': {'Choice':{
	// 								'Dialog': 'This is a choice 3',
	// 								'One': {
	// 									'Text': 'One',
	// 									'Do': {'Choice':{
	// 										'Dialog': 'This is a choice 4',
	// 										'One': {
	// 											'Text': 'One',
	// 											'Do': 'One'
	// 										},
	// 										'Two': {
	// 											'Text': 'Two',
	// 											'Do': 'Two'
	// 										},
	// 										'Disabled': {
	// 											'Text': 'Disabled',
	// 											'Do': 'Disabled',
	// 											'Clickable': function () {
	// 												return false;
	// 											}
	// 										},
	// 										'Hidden': {
	// 											'Text': 'Hidden',
	// 											'Do': 'Hidden',
	// 											'Condition': function () {
	// 												return false;
	// 											}
	// 										},
	// 										'OnChosen': {
	// 											'Text': 'On Click',
	// 											'Do': 'On Click',
	// 											'onChosen': function () {
	// 												this.storage ({ clicked: true });
	// 											}
	// 										}
	// 									}}
	// 								},
	// 								'Two': {
	// 									'Text': 'Two',
	// 									'Do': 'Two'
	// 								},
	// 								'Disabled': {
	// 									'Text': 'Disabled',
	// 									'Do': 'Disabled',
	// 									'Clickable': function () {
	// 										return false;
	// 									}
	// 								},
	// 								'Hidden': {
	// 									'Text': 'Hidden',
	// 									'Do': 'Hidden',
	// 									'Condition': function () {
	// 										return false;
	// 									}
	// 								},
	// 								'OnChosen': {
	// 									'Text': 'On Click',
	// 									'Do': 'On Click',
	// 									'onChosen': function () {
	// 										this.storage ({ clicked: true });
	// 									}
	// 								}
	// 							}}
	// 						},
	// 						'Two': {
	// 							'Text': 'Two',
	// 							'Do': 'Two'
	// 						},
	// 						'Disabled': {
	// 							'Text': 'Disabled',
	// 							'Do': 'Disabled',
	// 							'Clickable': function () {
	// 								return false;
	// 							}
	// 						},
	// 						'Hidden': {
	// 							'Text': 'Hidden',
	// 							'Do': 'Hidden',
	// 							'Condition': function () {
	// 								return false;
	// 							}
	// 						},
	// 						'OnChosen': {
	// 							'Text': 'On Click',
	// 							'Do': 'On Click',
	// 							'onChosen': function () {
	// 								this.storage ({ clicked: true });
	// 							}
	// 						}
	// 					}}
	// 				},
	// 				'Two': {
	// 					'Text': 'Two',
	// 					'Do': 'Two'
	// 				},
	// 				'Disabled': {
	// 					'Text': 'Disabled',
	// 					'Do': 'Disabled',
	// 					'Clickable': function () {
	// 						return false;
	// 					}
	// 				},
	// 				'Hidden': {
	// 					'Text': 'Hidden',
	// 					'Do': 'Hidden',
	// 					'Condition': function () {
	// 						return false;
	// 					}
	// 				},
	// 				'OnChosen': {
	// 					'Text': 'On Click',
	// 					'Do': 'On Click',
	// 					'onChosen': function () {
	// 						this.storage ({ clicked: true });
	// 					}
	// 				}
	// 			}},
	// 			'After'
	// 		]
	// 	});

	// 	cy.start ();
	// 	cy.proceed ();

	// 	cy.get ('text-box').contains ('This is a choice');

	// 	cy.get ('[data-choice="One"]').click ();
	// 	cy.get ('text-box').contains ('This is a choice 2');

	// 	cy.get ('[data-choice="One"]').click ();
	// 	cy.get ('text-box').contains ('This is a choice 3');

	// 	cy.get ('[data-choice="One"]').click ();
	// 	cy.get ('text-box').contains ('This is a choice 4');

	// 	cy.get ('[data-choice="One"]').click ();
	// 	cy.get ('text-box').contains ('One');

	// 	cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One', 'One', 'One', 'One']);

	// 	cy.rollback ();
	// 	cy.get ('text-box').contains ('This is a choice 4');

	// 	cy.rollback ();
	// 	cy.get ('text-box').contains ('This is a choice 3');

	// 	cy.rollback ();
	// 	cy.get ('text-box').contains ('This is a choice 2');

	// 	cy.rollback ();
	// 	cy.get ('text-box').contains ('This is a choice');

	// 	cy.rollback ();
	// 	cy.get ('text-box').contains ('Before');
	// 	cy.wrap (this.monogatari).invoke ('history', 'choice').should ('be.empty');


	// });


});