// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add ('open', () => {
	cy.visit ('./dist/index.html');
	cy.window ().its ('Monogatari.default').as ('monogatari');
	cy.window ().its ('Monogatari.default.debug').invoke ('level', 5);
});

Cypress.Commands.add ('start', function () {
	// this.monogatari.runListener ('start');
	cy.get ('[data-action="start"]').click ();
	// Prevent False Positives by waiting a bit
	cy.wait (150);
});

Cypress.Commands.add ('proceed',function () {
	this.monogatari.proceed ({ userInitiated: true, skip: false, autoPlay: false });

	// Prevent False Positives by waiting a bit
	cy.wait (150);
});

Cypress.Commands.add ('rollback', function () {
	this.monogatari.global ('block', false);
	this.monogatari.rollback ();

	// Prevent False Positives by waiting a bit
	cy.wait (150);
});

Cypress.Commands.add ('loadTestAssets', function (args) {
	const { nvl } = Object.assign ({
		nvl: false
	}, args);

	this.monogatari.settings ({
		'AssetsPath': {
			root: 'https://datadyne.perfectdark.space/monogatari/assets',
			scenes: 'images',
		},
		'ExperimentalFeatures': true
	});

	this.monogatari.assets ('videos', {
		'kirino': 'kirino.mp4',
		'dandelion': 'dandelion.mp4'
	});

	this.monogatari.assets ('images', {
		'polaroid': 'blurry_polaroid.jpg',
		'christmas': 'christmas.png'
	});

	this.monogatari.assets ('scenes', {
		'christmas': 'christmas.png'
	});

	this.monogatari.assets ('music', {
		'theme': 'theme.mp3',
		'subspace': 'subspace.mp3'
	});

	this.monogatari.action ('particles').particles ({
		'snow': {
			'particles': {
				'number': {
					'value': 400,
					'density': {
						'enable': true,
						'value_area': 800
					}
				},
				'color': {
					'value': '#fff'
				},
				'shape': {
					'type': 'circle',
					'stroke': {
						'width': 0,
						'color': '#000000'
					},
					'polygon': {
						'nb_sides': 5
					},
					'image': {
						'src': 'img\/github.svg',
						'width': 100,
						'height': 100
					}
				},
				'opacity': {
					'value': 0.5,
					'random': true,
					'anim': {
						'enable': false,
						'speed': 1,
						'opacity_min': 0.1,
						'sync': false
					}
				},
				'size': {
					'value': 10,
					'random': true,
					'anim': {
						'enable': false,
						'speed': 40,
						'size_min': 0.1,
						'sync': false
					}
				},
				'line_linked': {
					'enable': false,
					'distance': 500,
					'color': '#ffffff',
					'opacity': 0.4,
					'width': 2
				},
				'move': {
					'enable': true,
					'speed': 6,
					'direction': 'bottom',
					'random': false,
					'straight': false,
					'out_mode': 'out',
					'bounce': false,
					'attract': {
						'enable': false,
						'rotateX': 600,
						'rotateY': 1200
					}
				}
			},
			'interactivity': {
				'detect_on': 'canvas',
				'events': {
					'onhover': {
						'enable': true,
						'mode': 'bubble'
					},
					'onclick': {
						'enable': true,
						'mode': 'repulse'
					},
					'resize': true
				},
				'modes': {
					'grab': {
						'distance': 400,
						'line_linked': {
							'opacity': 0.5
						}
					},
					'bubble': {
						'distance': 400,
						'size': 4,
						'duration': 0.3,
						'opacity': 1,
						'speed': 3
					},
					'repulse': {
						'distance': 200,
						'duration': 0.4
					},
					'push': {
						'particles_nb': 4
					},
					'remove': {
						'particles_nb': 2
					}
				}
			},
			'retina_detect': true
		},
		'fireflies': {
			'particles': {
				'number': {
					'value': 202,
					'density': {
						'enable': true,
						'value_area': 800
					}
				},
				'color': {
					'value': '#0bd318'
				},
				'shape': {
					'type': 'circle',
					'stroke': {
						'width': 0,
						'color': '#000000'
					},
					'polygon': {
						'nb_sides': 5
					},
					'image': {
						'src': 'img/github.svg',
						'width': 100,
						'height': 100
					}
				},
				'opacity': {
					'value': 0.9299789953020032,
					'random': true,
					'anim': {
						'enable': true,
						'speed': 1,
						'opacity_min': 0,
						'sync': false
					}
				},
				'size': {
					'value': 3,
					'random': true,
					'anim': {
						'enable': false,
						'speed': 4,
						'size_min': 0.3,
						'sync': false
					}
				},
				'line_linked': {
					'enable': false,
					'distance': 150,
					'color': '#ffffff',
					'opacity': 0.4,
					'width': 1
				},
				'move': {
					'enable': true,
					'speed': 3.017060304327615,
					'direction': 'none',
					'random': true,
					'straight': false,
					'out_mode': 'out',
					'bounce': false,
					'attract': {
						'enable': false,
						'rotateX': 1042.21783956259,
						'rotateY': 600
					}
				}
			},
			'interactivity': {
				'detect_on': 'canvas',
				'events': {
					'onhover': {
						'enable': true,
						'mode': 'bubble'
					},
					'onclick': {
						'enable': true,
						'mode': 'repulse'
					},
					'resize': true
				},
				'modes': {
					'grab': {
						'distance': 400,
						'line_linked': {
							'opacity': 1
						}
					},
					'bubble': {
						'distance': 250,
						'size': 0,
						'duration': 2,
						'opacity': 0,
						'speed': 3
					},
					'repulse': {
						'distance': 400,
						'duration': 0.4
					},
					'push': {
						'particles_nb': 4
					},
					'remove': {
						'particles_nb': 2
					}
				}
			},
			'retina_detect': true
		}
	});

	this.monogatari.action ('Canvas').objects ({
		square: {
			start: ({ base }) => {
				base.width = 150;
				base.height = 150;
				const ctx = base.getContext('2d');

				ctx.fillStyle = 'green';
				ctx.fillRect(10, 10, 150, 150);
				return Promise.resolve ();

			}
		},
		circle: {
			start: function ({ base }) {
				base.width = 150;
				base.height = 150;
				const ctx = base.getContext('2d');

				ctx.fillStyle = 'green';
				ctx.arc(75, 75, 50, 0, 2 * Math.PI);

				setTimeout (() => {
					this.run ('hide canvas circle');
				}, 5000);

				return Promise.resolve ();
			}
		},
		stars: {
			layers: ['sky', 'stars'],
			props: {
				drawStar: (ctx, r) => {
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(r, 0);
					for (var i = 0; i < 9; i++) {
						ctx.rotate(Math.PI / 5);
						if (i % 2 === 0) {
							ctx.lineTo((r / 0.525731) * 0.200811, 0);
						} else {
							ctx.lineTo(r, 0);
						}
					}
					ctx.closePath();
					ctx.fill();
					ctx.restore();
				},
				drawSky: (sky) => {
					const width = sky.width;
					const height = sky.height;
					const ctx = sky.getContext('2d');
					ctx.fillRect(0, 0, width, height);
					ctx.translate(width / 2, height / 2);

					// Create a circular clipping path
					ctx.beginPath();
					ctx.arc(0, 0, width * 0.4, 0, Math.PI * 2, true);
					ctx.clip();

					// draw background
					var lingrad = ctx.createLinearGradient(0, -1 * width / 2, 0, width / 2);
					lingrad.addColorStop(0, '#232256');
					lingrad.addColorStop(1, '#143778');

					ctx.fillStyle = lingrad;
					ctx.fillRect(-width/2, -width/2, width, height);
				},
				drawStars: (stars, drawStar) => {
					const width = stars.width;
					const height = stars.height;
					const ctx = stars.getContext('2d');
					// draw stars
					for (var j = 1; j < 50; j++) {
						ctx.save();
						ctx.fillStyle = '#fff';
						ctx.translate(width - Math.floor(Math.random() * width), height - Math.floor(Math.random() * height));
						drawStar(ctx, Math.floor(Math.random() * 4) + 2);
						ctx.restore();
					}
				}
			},
			state: {

			},
			start: function ({ sky, stars }, props, state, container) {
				let width = 150;
				let height = 150;

				if (container.props.mode === 'background') {
					width = this.width ();
					height = this.height ();
				}

				sky.width = width;
				sky.height = height;

				stars.width = width;
				stars.height = height;

				props.drawSky (sky);
				props.drawStars (stars, props.drawStar);

				return Promise.resolve ();
			},
			stop: ({ sky, stars }, props, state, container) => {
				state.run = true;
				sky.getContext('2d').clearRect (0, 0, sky.width, sky.height);
				stars.getContext('2d').clearRect (0, 0, stars.width, stars.height);
			},
			resize: function ({ sky, stars }, props, state, container) {
				if (container.props.mode === 'background') {
					const width = this.width ();
					const height = this.height ();

					sky.getContext('2d').clearRect (0, 0, sky.width, sky.height);
					stars.getContext('2d').clearRect (0, 0, stars.width, stars.height);

					sky.width = width;
					sky.height = height;

					stars.width = width;
					stars.height = height;

					props.drawSky (sky);
					props.drawStars (stars, props.drawStar);
				}
			}
		}
	});

	this.monogatari.characters ({
		'y': {
			color: 'blue',
			name: 'Yui',
			directory: 'yui',
			layers: ['base', 'mouth', 'eyes', 'eyebrows'],
			sprites: {
				angry: 'angry.png',
				happy: 'happy.png',
				normal: 'normal.png',
				sad: 'sad.png',
				surprised: 'surprised.png',
				angry_layered: {
					'base': 'normal',
					'mouth': 'alone',
					'eyes': 'alone'
				},
				happy_layered: {
					'base': 'arm_raised',
					'mouth': 'smile',
					'eyes': 'alone',
					'eyebrows': 'normal'
				},
			},
			expressions: {
				angry: 'expressions/angry.png',
				happy: 'expressions/happy.png',
				normal: 'expressions/normal.png',
				sad: 'expressions/sad.png',
				surprised: 'expressions/surprised.png',
			},
			layer_assets: {
				base: {
					normal: 'layers/base.png',
					arm_raised: 'body/arm_raised.png'
				},
				mouth: {
					alone: 'layers/mouth_alone.png',
					smile: 'mouth/smile.png'
				},
				eyes: {
					alone: 'layers/eyes_alone.png'
				},
				eyebrows: {
					normal: 'eyebrows/normal.png'
				}
			},
			nvl
		},
		'yd1': {
			color: 'blue',
			name: 'Yui',
			directory: 'yui',
			sprites: {
				angry: 'angry.png',
				happy: 'happy.png',
				normal: 'normal.png',
				sad: 'sad.png',
				surprised: 'surprised.png',
			},
			expressions: {
				angry: 'expressions/angry.png',
				happy: 'expressions/happy.png',
				normal: 'expressions/normal.png',
				sad: 'expressions/sad.png',
				surprised: 'expressions/surprised.png',
			},
			default_expression: 'expressions/sad.png',
			nvl
		},
		'yd2': {
			color: 'blue',
			name: 'Yui',
			directory: 'yui',
			sprites: {
				angry: 'angry.png',
				happy: 'happy.png',
				normal: 'normal.png',
				sad: 'sad.png',
				surprised: 'surprised.png',
			},
			expressions: {
				angry: 'expressions/angry.png',
				happy: 'expressions/happy.png',
				normal: 'expressions/normal.png',
				sad: 'expressions/sad.png',
				surprised: 'expressions/surprised.png',
			},
			default_expression: 'angry',
			nvl
		},
		'm': {
			name: 'Mio',
			directory: 'mio',
			sprites: {
				angry: 'angry.png',
				happy: 'happy.png',
				normal: 'normal.png',
				sad: 'sad.png',
				surprised: 'surprised.png',
			},
			expressions: {
				angry: 'expressions/angry.png',
				happy: 'expressions/happy.png',
				normal: 'expressions/normal.png',
				sad: 'expressions/sad.png',
				surprised: 'expressions/surprised.png',
			},
			nvl
		}
	});

	// We'll add for a while to ensure all assets have been loaded
	// cy.wait (5000);
});

Cypress.Commands.add ('save', function (slot) {
	return this.monogatari.saveTo ('SaveLabel', slot);
});

Cypress.Commands.add ('load', function (slot) {
	return this.monogatari.loadFromSlot ('Save_' + slot).then (() => {
		this.monogatari.run (this.monogatari.label ()[this.monogatari.state ('step')]);
	});
});
