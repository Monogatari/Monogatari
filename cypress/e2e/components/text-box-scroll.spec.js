context ('Text Box Scrolling and Unread', function () {

	beforeEach (() => {
		cy.open ();
		cy.loadTestAssets ();
	});

	it ('Auto-scrolls to bottom when new NVL dialog is added', function () {
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y Line 1',
				'y Line 2',
				'y Line 3',
				'y Line 4',
				'y Line 5',
				'y Line 6',
				'y Line 7',
				'y Line 8',
				'y Line 9',
				'y Line 10',
				'y Line 11',
				'y Line 12'
			]
		});

		cy.start ();

		for (let i = 0; i < 11; i++) {
			cy.proceed ();
		}

		cy.get ('text-box [data-content="text"]').then (($text) => {
			const text = $text[0];
			if (text.scrollHeight > text.clientHeight) {
				expect (text.scrollTop).to.be.greaterThan (0);
			}
		});
	});

	it ('Adds unread class when NVL content overflows', function () {
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);

		const dialogs = [];
		for (let i = 1; i <= 20; i++) {
			dialogs.push (`y Dialog line ${i}`);
		}

		this.monogatari.script ({
			'Start': dialogs
		});

		cy.start ();

		for (let i = 0; i < 19; i++) {
			cy.proceed ();
		}

		cy.get ('text-box [data-content="text"]').then (($text) => {
			$text[0].scrollTop = 0;
		});

		cy.get ('text-box [data-content="text"]').trigger ('scroll');

		cy.get ('text-box').should ('have.class', 'unread');
	});

	it ('Removes unread class when scrolled to bottom', function () {
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);

		const dialogs = [];
		for (let i = 1; i <= 20; i++) {
			dialogs.push (`y Dialog line ${i}`);
		}

		this.monogatari.script ({
			'Start': dialogs
		});

		cy.start ();

		for (let i = 0; i < 19; i++) {
			cy.proceed ();
		}

		cy.get ('text-box [data-content="text"]').then (($text) => {
			$text[0].scrollTop = 0;
		});
		cy.get ('text-box [data-content="text"]').trigger ('scroll');
		cy.get ('text-box').should ('have.class', 'unread');

		cy.get ('text-box [data-content="text"]').then (($text) => {
			const text = $text[0];
			text.scrollTop = text.scrollHeight;
		});
		cy.get ('text-box [data-content="text"]').trigger ('scroll');

		cy.get ('text-box').should ('not.have.class', 'unread');
	});

	it ('Switches to NVL mode when NVL character speaks', function () {
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);
		this.monogatari.script ({
			'Start': [
				'y Hello from NVL',
				'y More NVL text'
			]
		});

		cy.start ();
		cy.get ('text-box').should ('have.attr', 'mode', 'nvl');
	});

	it ('Text content area is scrollable in NVL mode', function () {
		cy.loadTestAssets ({ nvl: true });
		this.monogatari.setting ('TypeAnimation', false);

		const dialogs = [];
		for (let i = 1; i <= 15; i++) {
			dialogs.push (`y Long dialog line number ${i} with some extra text to make it longer`);
		}

		this.monogatari.script ({
			'Start': dialogs
		});

		cy.start ();

		for (let i = 0; i < 14; i++) {
			cy.proceed ();
		}

		cy.get ('text-box [data-content="text"]').then (($text) => {
			const text = $text[0];
			expect (text.scrollHeight).to.be.greaterThan (text.clientHeight);
		});

		cy.get ('text-box [data-content="text"]').should ('have.css', 'overflow-y', 'auto');
	});
});
