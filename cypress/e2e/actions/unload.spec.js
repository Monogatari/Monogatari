context ('Unload', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
		cy.window ().its ('Monogatari.default').as ('monogatari');
	});

	it ('Unloads single audio asset', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload music theme blocking',
				'One',
				'unload music theme',
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

		// Verify audio is no longer cached
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('be.undefined');

		cy.get ('text-box').contains ('Two');
	});

	it ('Unloads single image asset', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload scene christmas blocking',
				'One',
				'unload scene christmas',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (500);

		// Verify image is cached (use then() to avoid DOM element tracking issues)
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('scenes/christmas')).to.not.be.undefined;
		});

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		// Verify image is no longer cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('scenes/christmas')).to.be.undefined;
		});

		cy.get ('text-box').contains ('Two');
	});

	it ('Unloads character sprite', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload character y happy blocking',
				'One',
				'unload character y happy',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (500);

		// Verify sprite is cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('characters/y/happy')).to.not.be.undefined;
		});

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		// Verify sprite is no longer cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('characters/y/happy')).to.be.undefined;
		});

		cy.get ('text-box').contains ('Two');
	});

	it ('Unloads all sprites for a character', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload character y happy blocking',
				'preload character y sad blocking',
				'One',
				'unload character y',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (1000);

		// Verify sprites are cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('characters/y/happy')).to.not.be.undefined;
			expect (this.monogatari.imageCache ('characters/y/sad')).to.not.be.undefined;
		});

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		// Verify all sprites are no longer cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('characters/y/happy')).to.be.undefined;
			expect (this.monogatari.imageCache ('characters/y/sad')).to.be.undefined;
		});

		cy.get ('text-box').contains ('Two');
	});

	it ('Unloads entire block', function () {
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
				'One',
				'unload block test_block',
				'Two'
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

		cy.proceed ();

		// Verify all block assets are no longer cached
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('be.undefined');
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('scenes/christmas')).to.be.undefined;
		});

		cy.get ('text-box').contains ('Two');
	});

	it ('Unloads entire audio category', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload music theme blocking',
				'preload music subspace blocking',
				'One',
				'unload music',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (1000);

		// Verify both music assets are cached
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('not.be.undefined');
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/subspace').should ('not.be.undefined');

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		// Verify all music assets are no longer cached
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('be.undefined');
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/subspace').should ('be.undefined');

		cy.get ('text-box').contains ('Two');
	});

	it ('Unloads entire image category', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload image polaroid blocking',
				'preload image christmas blocking',
				'One',
				'unload images',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		cy.wait (1000);

		// Verify both images are cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('images/polaroid')).to.not.be.undefined;
			expect (this.monogatari.imageCache ('images/christmas')).to.not.be.undefined;
		});

		cy.get ('text-box').contains ('One');

		cy.proceed ();

		// Verify all images are no longer cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('images/polaroid')).to.be.undefined;
			expect (this.monogatari.imageCache ('images/christmas')).to.be.undefined;
		});

		cy.get ('text-box').contains ('Two');
	});

	it ('Unloads all cached assets', function () {
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload music theme blocking',
				'preload scene christmas blocking',
				'preload character y happy blocking',
				'One',
				'unload all',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		// Wait for blocking preload to complete (indicated by text advancing to "One")
		cy.get ('text-box').contains ('One');

		// Verify assets are cached after preload completes
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('not.be.undefined');
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('scenes/christmas')).to.not.be.undefined;
			expect (this.monogatari.imageCache ('characters/y/happy')).to.not.be.undefined;
		});

		cy.proceed ();
		// Wait for unload to complete
		cy.get ('text-box').contains ('Two');

		// Verify all assets are no longer cached
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('be.undefined');
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('scenes/christmas')).to.be.undefined;
			expect (this.monogatari.imageCache ('characters/y/happy')).to.be.undefined;
		});
	});

	it ('Unloads custom category single asset', function () {
		this.monogatari.setting ('TypeAnimation', false);

		// Register a custom category 'posters' that uses the 'image' loader
		this.monogatari.action ('Preload').registerCategory ('posters', 'image');

		// Configure AssetsPath for posters
		const assetsPath = this.monogatari.setting ('AssetsPath');
		assetsPath.posters = 'images';
		this.monogatari.setting ('AssetsPath', assetsPath);

		// Register a poster asset
		this.monogatari.assets ('posters', {
			'movie_poster': 'blurry_polaroid.jpg'
		});

		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload posters movie_poster blocking',
				'One',
				'unload posters movie_poster',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		// Wait for blocking preload to complete
		cy.get ('text-box').contains ('One');

		// Verify the custom category asset is cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('posters/movie_poster')).to.not.be.undefined;
		});

		cy.proceed ();
		// Wait for unload to complete
		cy.get ('text-box').contains ('Two');

		// Verify the asset is no longer cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('posters/movie_poster')).to.be.undefined;
		});
	});

	it ('Unloads entire custom category', function () {
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

		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload posters poster1 blocking',
				'preload posters poster2 blocking',
				'One',
				'unload posters',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		// Wait for both blocking preloads to complete
		cy.get ('text-box').contains ('One');

		// Verify both posters are cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('posters/poster1')).to.not.be.undefined;
			expect (this.monogatari.imageCache ('posters/poster2')).to.not.be.undefined;
		});

		cy.proceed ();
		// Wait for unload to complete
		cy.get ('text-box').contains ('Two');

		// Verify all posters are no longer cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('posters/poster1')).to.be.undefined;
			expect (this.monogatari.imageCache ('posters/poster2')).to.be.undefined;
		});
	});

	it ('Unloads custom category in block', function () {
		this.monogatari.setting ('TypeAnimation', false);

		// Register a custom category
		this.monogatari.action ('Preload').registerCategory ('posters', 'image');

		// Configure AssetsPath for posters
		const assetsPath = this.monogatari.setting ('AssetsPath');
		assetsPath.posters = 'images';
		this.monogatari.setting ('AssetsPath', assetsPath);

		// Register poster assets
		this.monogatari.assets ('posters', {
			'poster1': 'blurry_polaroid.jpg'
		});

		// Configure a preload block with custom category
		this.monogatari.action ('Preload').blocks ({
			'custom_block': {
				posters: ['poster1'],
				music: ['theme']
			}
		});

		this.monogatari.script ({
			'Start': [
				'Zero',
				'preload block custom_block blocking',
				'One',
				'unload block custom_block',
				'Two'
			]
		});

		cy.start ();
		cy.get ('text-box').contains ('Zero');

		cy.proceed ();
		// Wait for blocking preload to complete
		cy.get ('text-box').contains ('One');

		// Verify all block assets are cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('posters/poster1')).to.not.be.undefined;
		});
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('not.be.undefined');

		cy.proceed ();
		// Wait for unload to complete
		cy.get ('text-box').contains ('Two');

		// Verify all block assets are no longer cached
		cy.wrap (null).then (() => {
			expect (this.monogatari.imageCache ('posters/poster1')).to.be.undefined;
		});
		cy.wrap (this.monogatari).invoke ('audioBufferCache', 'music/theme').should ('be.undefined');
	});

});
