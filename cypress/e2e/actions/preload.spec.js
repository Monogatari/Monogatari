context ('Preload', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Preloads single music asset (non-blocking)', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload music theme',
				'One',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		// Should advance immediately (non-blocking)
		cy.get ('text-box').contains ('One');

		// Wait for async preload to complete
		cy.wait (500);

		// Verify audio buffer is cached
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('not.be.undefined');
	});

	it ('Preloads single music asset (blocking)', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload music theme blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		// Wait for blocking preload to complete
		cy.wait (500);

		// Should have the buffer cached after blocking preload completes
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('not.be.undefined');

		cy.get ('text-box').contains ('One');
	});

	it ('Preloads sound asset', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload sound beep blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (500);

		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'sounds/beep').should ('not.be.undefined');
		cy.get ('text-box').contains ('One');
	});

	it ('Preloads voice asset', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload voice sample blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (500);

		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'voices/sample').should ('not.be.undefined');
		cy.get ('text-box').contains ('One');
	});

	it ('Preloads scene image (non-blocking)', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload scene christmas',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();

		// Should advance immediately (non-blocking)
		cy.get ('text-box').contains ('One');

		// Wait for async preload to complete
		cy.wait (500);

		// Verify image is cached (use then() to avoid DOM element tracking issues)
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('scenes/christmas')).to.not.be.undefined;
		});
	});

	it ('Preloads scene image (blocking)', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload scene christmas blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (500);

		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('scenes/christmas')).to.not.be.undefined;
		});
		cy.get ('text-box').contains ('One');
	});

	it ('Preloads image asset', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload image polaroid blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (500);

		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('images/polaroid')).to.not.be.undefined;
		});
		cy.get ('text-box').contains ('One');
	});

	it ('Preloads character sprite', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload character y happy blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (500);

		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('characters/y/happy')).to.not.be.undefined;
		});
		cy.get ('text-box').contains ('One');
	});

	it ('Preloads configured block', function () {
		this.monogatari.setting ('TypeAnimation', false);

		// Configure a preload block
		this.monogatari.action ('Preload').blocks ({
			'test_block': {
				music: ['theme'],
				scenes: ['christmas']
			}
		});

		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload block test_block blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (1000);

		// Verify all block assets are cached
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('not.be.undefined');
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('scenes/christmas')).to.not.be.undefined;
		});

		cy.get ('text-box').contains ('One');
	});

	it ('Preloads block with character sprites', function () {
		this.monogatari.setting ('TypeAnimation', false);

		// Configure a preload block with characters
		this.monogatari.action ('Preload').blocks ({
			'character_block': {
				characters: {
					'y': ['happy', 'sad']
				}
			}
		});

		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload block character_block blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (1000);

		// Verify character sprites are cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('characters/y/happy')).to.not.be.undefined;
			expect (this.monogatari.imageCache ('characters/y/sad')).to.not.be.undefined;
		});

		cy.get ('text-box').contains ('One');
	});

	it ('Play action uses cached audio', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload music theme blocking',
				'One',
				'play music theme loop',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (500);

		// Verify audio is cached
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('not.be.undefined');

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		// Music should be playing using cached buffer
		cy.wrap (this.monogatari).invoke ('state', 'music').should ('deep.equal', [{ statement: 'play music theme loop', paused: false }]);
		cy.wrap (this.monogatari).invoke ('mediaPlayers', 'music').should ('have.length', 1);

		cy.get ('text-box').contains ('Two');
	});

	it ('Does not re-preload already cached assets', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload sound beep blocking',
				'One',
				'preload sound beep blocking',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		// Wait for blocking preload to complete (indicated by text advancing to "One")
		cy.get ('text-box').contains ('One');

		// Capture the cached buffer after blocking preload completes
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'sounds/beep').should ('not.be.undefined').then ((cachedBuffer) => {
			cy.proceed ();
			// Wait for second blocking preload to complete
			cy.get ('text-box').contains ('Two');

			// Same buffer should still be in cache (not re-fetched)
			cy.wrap (this.monogatari).invoke ('audioBufferCache', 'sounds/beep').should ('equal', cachedBuffer);
		});
	});

	it ('Supports custom category registration with existing loader', function () {
		this.monogatari.setting ('TypeAnimation', false);

		// Register a custom category 'posters' that uses the 'image' loader
		this.monogatari.action ('Preload').registerCategory ('posters', 'image');

		// Configure AssetsPath for posters (same as images for testing)
		const assetsPath = this.monogatari.setting ('AssetsPath');
		assetsPath.posters = 'images';
		this.monogatari.setting ('AssetsPath', assetsPath);

		// Register a poster asset (using an existing image file)
		this.monogatari.assets ('posters', {
			'movie_poster': 'blurry_polaroid.jpg'
		});

		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload posters movie_poster blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		// Wait for blocking preload to complete (indicated by text advancing to "One")
		cy.get ('text-box').contains ('One');

		// Verify the custom category asset is cached using the image cache
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('posters/movie_poster')).to.not.be.undefined;
		});
	});

	it ('Supports custom category in preload blocks', function () {
		this.monogatari.setting ('TypeAnimation', false);

		// Register a custom category
		this.monogatari.action ('Preload').registerCategory ('posters', 'image');

		// Configure AssetsPath for posters
		const assetsPath = this.monogatari.setting ('AssetsPath');
		assetsPath.posters = 'images';
		this.monogatari.setting ('AssetsPath', assetsPath);

		// Register poster assets
		this.monogatari.assets ('posters', {
			'poster1': 'blurry_polaroid.jpg',
			'poster2': 'christmas.png'
		});

		// Configure a preload block with custom category
		this.monogatari.action ('Preload').blocks ({
			'custom_block': {
				posters: ['poster1', 'poster2'],
				music: ['theme']
			}
		});

		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload block custom_block blocking',
				'One'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (1000);

		// Verify all block assets are cached including custom category
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('posters/poster1')).to.not.be.undefined;
			expect (this.monogatari.imageCache ('posters/poster2')).to.not.be.undefined;
		});
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('not.be.undefined');

		cy.get ('text-box').contains ('One');
	});

});
