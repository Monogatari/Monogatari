context ('Show Character', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays the character correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'One',
				'show character y angry_layered with fadeIn',
				'Two',
				'hide character y',
				'Three',
				'show character y angry_layered with fadeIn',
				'Four',
				'hide character y:mouth',
				'Five',
				'show character y happy_layered with fadeIn',
				'Six',
				'show character y:mouth alone with fadeIn',
				'Seven',
				'show character y happy',
				'Eight',
				'show character y happy_layered with fadeIn',
				'Nine'
			]
		});

		cy.start ();

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		cy.get ('[data-sprite="angry_layered"]').should ('be.visible');
		cy.get ('[data-sprite="angry_layered"]').should('have.class', 'fadeIn');

		cy.get ('[data-layer="base"]').should ('be.visible');
		cy.get ('[data-layer="mouth"]').should ('be.visible');
		cy.get ('[data-layer="eyes"]').should ('be.visible');


		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry_layered with fadeIn']);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base normal',
			'show character y:mouth alone',
			'show character y:eyes alone'
		]);
		cy.wrap (this.monogatari).invoke ('history', 'characterLayer').should ('deep.equal', [
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			}
		]);

		cy.get ('text-box').contains ('Two');

		cy.proceed();

		cy.get ('[data-sprite="angry_layered"]').should ('not.exist');

		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', []);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', []);

		cy.get ('text-box').contains ('Three');


		cy.proceed();

		cy.get ('[data-sprite="angry_layered"]').should ('be.visible');
		cy.get ('[data-sprite="angry_layered"]').should('have.class', 'fadeIn');

		cy.get ('[data-layer="base"]').should ('be.visible');
		cy.get ('[data-layer="mouth"]').should ('be.visible');
		cy.get ('[data-layer="eyes"]').should ('be.visible');


		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry_layered with fadeIn']);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base normal',
			'show character y:mouth alone',
			'show character y:eyes alone'
		]);
		cy.wrap (this.monogatari).invoke ('history', 'characterLayer').should ('deep.equal', [
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			},
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			}
		]);

		cy.get ('text-box').contains ('Four');

		cy.proceed();

		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base normal',
			'show character y:eyes alone'
		]);

		cy.get ('[data-layer="mouth"]').should ('not.exist');

		cy.get ('text-box').contains ('Five');

		cy.proceed();



		cy.get ('[data-sprite="happy_layered"]').should ('be.visible');
		cy.get ('[data-sprite="happy_layered"]').should('have.class', 'fadeIn');

		cy.get ('[data-layer="base"]').should ('be.visible');
		cy.get ('[data-layer="mouth"]').should ('be.visible');
		cy.get ('[data-layer="eyes"]').should ('be.visible');
		cy.get ('[data-layer="eyebrows"]').should ('be.visible');



		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y happy_layered with fadeIn']);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base arm_raised',
			'show character y:mouth smile',
			'show character y:eyes alone',
			'show character y:eyebrows normal'
		]);
		cy.wrap (this.monogatari).invoke ('history', 'characterLayer').should ('deep.equal', [
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			},
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			},
			{
				parent: 'show character y happy_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base arm_raised',
						previous: 'show character y:base normal'
					},
					{
						statement: 'show character y:mouth smile',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: 'show character y:eyes alone'
					},
					{
						statement: 'show character y:eyebrows normal',
						previous: null
					},
				]
			}
		]);

		cy.get ('text-box').contains ('Six');

		cy.proceed();

		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base arm_raised',
			'show character y:eyes alone',
			'show character y:eyebrows normal',
			'show character y:mouth alone with fadeIn',
		]);

		cy.get ('text-box').contains ('Seven');

		cy.proceed();

		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', []);
		cy.get ('[data-layer]:not([data-layer="base"])').should ('not.exist');

		cy.get ('text-box').contains ('Eight');

		cy.proceed();

		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base arm_raised',
			'show character y:mouth smile',
			'show character y:eyes alone',
			'show character y:eyebrows normal'
		]);

		cy.get ('text-box').contains ('Nine');

		cy.rollback();

		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', []);
		cy.get ('[data-layer]:not([data-layer="base"])').should ('not.exist');

		cy.get ('text-box').contains ('Eight');

		cy.rollback();

		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base arm_raised',

			'show character y:eyes alone',
			'show character y:eyebrows normal',
			'show character y:mouth alone with fadeIn',

		]);

		cy.get ('text-box').contains ('Seven');

		cy.rollback();

		cy.get ('[data-sprite="happy_layered"]').should ('be.visible');
		cy.get ('[data-sprite="happy_layered"]').should('have.class', 'fadeIn');

		cy.get ('[data-layer="base"]').should ('be.visible');
		cy.get ('[data-layer="mouth"]').should ('be.visible');
		cy.get ('[data-layer="eyes"]').should ('be.visible');
		cy.get ('[data-layer="eyebrows"]').should ('be.visible');



		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y happy_layered with fadeIn']);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base arm_raised',

			'show character y:eyes alone',
			'show character y:eyebrows normal',
			'show character y:mouth smile',
		]);
		cy.wrap (this.monogatari).invoke ('history', 'characterLayer').should ('deep.equal', [
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			},
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			},
			{
				parent: 'show character y happy_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base arm_raised',
						previous: 'show character y:base normal'
					},
					{
						statement: 'show character y:mouth smile',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: 'show character y:eyes alone'
					},
					{
						statement: 'show character y:eyebrows normal',
						previous: null
					},
				]
			}
		]);

		cy.get ('text-box').contains ('Six');

		cy.rollback();

		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base normal',
			'show character y:eyes alone'
		]);

		cy.get ('[data-layer="mouth"]').should ('not.exist');

		cy.get ('text-box').contains ('Five');

		cy.rollback();

		cy.get ('[data-sprite="angry_layered"]').should ('be.visible');
		cy.get ('[data-sprite="angry_layered"]').should('have.class', 'fadeIn');

		cy.get ('[data-layer="base"]').should ('be.visible');
		cy.get ('[data-layer="mouth"]').should ('be.visible');
		cy.get ('[data-layer="eyes"]').should ('be.visible');


		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry_layered with fadeIn']);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base normal',

			'show character y:eyes alone',
			'show character y:mouth alone',
		]);
		cy.wrap (this.monogatari).invoke ('history', 'characterLayer').should ('deep.equal', [
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			},
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			}
		]);

		cy.get ('text-box').contains ('Four');

		cy.rollback();

		cy.get ('[data-sprite="angry_layered"]').should ('not.exist');

		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', []);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', []);

		cy.get ('text-box').contains ('Three');

		cy.rollback();

		cy.get ('[data-sprite="angry_layered"]').should ('be.visible');
		cy.get ('[data-sprite="angry_layered"]').should('have.class', 'fadeIn');

		cy.get ('[data-layer="base"]').should ('be.visible');
		cy.get ('[data-layer="mouth"]').should ('be.visible');
		cy.get ('[data-layer="eyes"]').should ('be.visible');


		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry_layered with fadeIn']);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', [
			'show character y:base normal',
			'show character y:mouth alone',
			'show character y:eyes alone'
		]);
		cy.wrap (this.monogatari).invoke ('history', 'characterLayer').should ('deep.equal', [
			{
				parent: 'show character y angry_layered with fadeIn',
				layers: [
					{
						statement: 'show character y:base normal',
						previous: null
					},
					{
						statement: 'show character y:mouth alone',
						previous: null
					},
					{
						statement: 'show character y:eyes alone',
						previous: null
					}
				]
			}
		]);

		cy.get ('text-box').contains ('Two');

		cy.rollback();

		cy.get ('text-box').contains ('One');

		cy.wrap (this.monogatari).invoke ('history', 'characterLayer').should ('deep.equal', []);
		cy.wrap (this.monogatari).invoke ('history', 'character').should ('deep.equal', []);

		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', []);
		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', []);
	});
});
