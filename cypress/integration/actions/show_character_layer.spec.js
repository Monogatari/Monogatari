context ('Show Character', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Displays the character correctly', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'show character y angry_layered with fadeIn',
				'y Tada!',
				'hide character y',
				'y You can\'t see me now',
				'show character y angry_layered with fadeIn',
				'hide character y:mouth',
				'y Mouth is gone!'
			]
		});

		cy.start ();
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

		cy.proceed();

		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', []);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', []);

		cy.rollback();

		cy.get ('[data-sprite="angry_layered"]').should ('be.visible');
		cy.get ('[data-sprite="angry_layered"]').should('have.class', 'fadeIn');

		cy.get ('[data-layer="base"]').should ('be.visible');
		cy.get ('[data-layer="mouth"]').should ('be.visible');
		cy.get ('[data-layer="eyes"]').should ('be.visible');


		cy.wrap (this.monogatari).invoke ('state', 'characters').should ('deep.equal', ['show character y angry_layered with fadeIn']);
		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', ['show character y:base normal', 'show character y:mouth alone', 'show character y:eyes alone']);

		cy.proceed();

		cy.proceed();

		cy.get ('[data-layer="mouth"]').should ('not.exist');

		cy.wrap (this.monogatari).invoke ('state', 'characterLayers').should ('deep.equal', ['show character y:base normal', 'show character y:eyes alone']);

	});
});
