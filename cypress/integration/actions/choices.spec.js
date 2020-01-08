context ('Choices', function () {

	beforeEach (() => {
		cy.open ();

	});

	it ('Displays dialog when one is provided', function () {
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
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnClick': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onClick': function () {
							this.storage ('clicked', true);
						}
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('text-box').contains ('This is a choice');
	});

	it ('Doesn\'t display choices whose `Show` function returned false.', function () {
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
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnClick': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onClick': function () {
							this.storage ('clicked', true);
						}
					}
				}},
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
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': 'One'
					},
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnClick': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onClick': function () {
							this.storage ('clicked', true);
						}
					}
				}},
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
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': 'One'
					},
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnClick': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onClick': function () {
							this.storage ('clicked', true);
						}
					}
				}},
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
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': 'One'
					},
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnClick': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onClick': function () {
							this.storage ('clicked', true);
						}
					}
				}},
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
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': 'One'
					},
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnChosen': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onChosen': function () {
							this.storage ({ clicked: true });
						}
					}
				}},
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
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': 'One'
					},
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnChosen': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onChosen': function () {
							this.storage ({ clicked: true });
						}
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="One"]').click ();
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One']);

	});

	it ('Saves the selected choice on the `choice` history.', function () {
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
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnChosen': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onChosen': function () {
							this.storage ({ clicked: true });
						}
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="One"]').click ();
		cy.proceed ();
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One']);
		cy.get ('text-box').contains ('One');

	});

	it ('Saves the selected choice on the `choice` history.', function () {
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
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnChosen': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onChosen': function () {
							this.storage ({ clicked: true });
						}
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="One"]').click ();

		cy.proceed ();

		cy.rollback ();

		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One']);
		cy.get ('text-box').contains ('One');
		cy.rollback ();
		// cy.get ('choice-container').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('be.empty');
		// cy.rollback ();

		// cy.get ('text-box').contains ('Before');

	});

	///////////////////

	it ('Saves the selected choice on the `choice` history.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': 'show background black'
					},
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnChosen': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onChosen': function () {
							this.storage ({ clicked: true });
						}
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="One"]').click ();
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One']);

	});

	it ('Saves the selected choice on the `choice` history.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': 'show background black'
					},
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnChosen': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onChosen': function () {
							this.storage ({ clicked: true });
						}
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="One"]').click ();
		//cy.proceed ();

		cy.get ('text-box').contains ('After');
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One']);

		// cy.proceed ();
		// cy.get ('text-box').contains ('After');
		// cy.wrap (this.monogatari).invoke ('history', 'choice').should ('be.empty');
		cy.rollback ();
		cy.get ('choice-container').should ('be.visible');
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('be.empty');
	});

	it ('Saves the selected choice on the `choice` history.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': 'show background black'
					},
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnChosen': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onChosen': function () {
							this.storage ({ clicked: true });
						}
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('[data-choice="One"]').click ();
		// cy.proceed ();
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One']);
		cy.get ('text-box').contains ('After');
		cy.rollback ();
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('be.empty');
		cy.get ('text-box').contains ('Before');

	});

	it ('Supports nested statements.', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Before',
				{'Choice':{
					'Dialog': 'This is a choice',
					'One': {
						'Text': 'One',
						'Do': {'Choice':{
							'Dialog': 'This is a choice 2',
							'One': {
								'Text': 'One',
								'Do': {'Choice':{
									'Dialog': 'This is a choice 3',
									'One': {
										'Text': 'One',
										'Do': {'Choice':{
											'Dialog': 'This is a choice 4',
											'One': {
												'Text': 'One',
												'Do': 'One'
											},
											'Two': {
												'Text': 'Two',
												'Do': 'Two'
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
												'Show': function () {
													return false;
												}
											},
											'OnChosen': {
												'Text': 'On Click',
												'Do': 'On Click',
												'onChosen': function () {
													this.storage ({ clicked: true });
												}
											}
										}}
									},
									'Two': {
										'Text': 'Two',
										'Do': 'Two'
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
										'Show': function () {
											return false;
										}
									},
									'OnChosen': {
										'Text': 'On Click',
										'Do': 'On Click',
										'onChosen': function () {
											this.storage ({ clicked: true });
										}
									}
								}}
							},
							'Two': {
								'Text': 'Two',
								'Do': 'Two'
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
								'Show': function () {
									return false;
								}
							},
							'OnChosen': {
								'Text': 'On Click',
								'Do': 'On Click',
								'onChosen': function () {
									this.storage ({ clicked: true });
								}
							}
						}}
					},
					'Two': {
						'Text': 'Two',
						'Do': 'Two'
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
						'Show': function () {
							return false;
						}
					},
					'OnChosen': {
						'Text': 'On Click',
						'Do': 'On Click',
						'onChosen': function () {
							this.storage ({ clicked: true });
						}
					}
				}},
				'After'
			]
		});

		cy.start ();
		cy.proceed ();

		cy.get ('text-box').contains ('This is a choice');

		cy.get ('[data-choice="One"]').click ();
		cy.get ('text-box').contains ('This is a choice 2');

		cy.get ('[data-choice="One"]').click ();
		cy.get ('text-box').contains ('This is a choice 3');

		cy.get ('[data-choice="One"]').click ();
		cy.get ('text-box').contains ('This is a choice 4');

		cy.get ('[data-choice="One"]').click ();
		cy.get ('text-box').contains ('One');

		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('deep.equal', ['One', 'One', 'One', 'One']);

		// cy.rollback ();
		// cy.get ('text-box').contains ('This is a choice 4');

		// cy.rollback ();
		// cy.get ('text-box').contains ('This is a choice 3');

		// cy.rollback ();
		// cy.get ('text-box').contains ('This is a choice 2');

		// cy.rollback ();
		// cy.get ('text-box').contains ('This is a choice');

		cy.rollback ();
		cy.get ('text-box').contains ('Before');
		cy.wrap (this.monogatari).invoke ('history', 'choice').should ('be.empty');


	});
});