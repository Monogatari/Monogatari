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
			root: 'https://datadyne.perfectdark.space/monogatari/assets'
		}
	});

	this.monogatari.assets ('videos', {
		'kirino': 'kirino.mp4',
		'dandelion': 'dandelion.mp4'
	});

	this.monogatari.assets ('images', {
		'polaroid': 'blurry_polaroid.jpg',
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

	this.monogatari.characters ({
		'y': {
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
});

Cypress.Commands.add ('save', function (slot) {
	return this.monogatari.saveTo ('SaveLabel', slot);
});

Cypress.Commands.add ('load', function (slot) {
	return this.monogatari.loadFromSlot ('Save_' + slot).then (() => {
		this.monogatari.run (this.monogatari.label ()[this.monogatari.state ('step')]);
	});
});