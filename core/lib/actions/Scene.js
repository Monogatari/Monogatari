import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Scene extends Action {

	static setup () {
		Monogatari.history ('scene');
		Monogatari.history ('sceneElements');
		Monogatari.state ({
			scene: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { scene } = Monogatari.state ();
		if (scene !== '') {
			Monogatari.run (scene, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('scene').pop ();
		}
		return Promise.resolve ();
	}

	static reset () {
		$_(`${Monogatari.selector} [data-ui="background"]`).style ('background-image', 'initial');
		$_(`${Monogatari.selector} [data-ui="background"]`).style ('background-color', 'initial');
		Monogatari.state ({
			scene: ''
		});
		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'scene';
	}

	constructor ([ show, type, scene, separator, ...classes ]) {
		super ();
		this.scene = scene;
		this.property = 'background-image';
		if (typeof Monogatari.asset ('scenes', scene) !== 'undefined') {
			this.value = `url(assets/scenes/${Monogatari.asset ('scenes', scene)})`;
		} else {
			if (this.scene.indexOf ('.') === -1) {
				this.property = 'background-color';
			}
			this.value = this.scene;
		}

		if (typeof classes !== 'undefined') {
			this.classes = ['animated', ...classes];
		} else {
			this.classes = [];
		}
	}

	willApply () {
		const scene_elements = [];
		$_(`${Monogatari.selector} #game img:not([data-ui="face"]):not([data-visibility="invisible"])`).each ((element) => {
			scene_elements.push (element.outerHTML);
		});

		Monogatari.history ('sceneElements').push (scene_elements);

		$_(`${Monogatari.selector} [data-character]`).remove ();
		$_(`${Monogatari.selector} [data-image]`).remove ();
		$_(`${Monogatari.selector} [data-ui="background"]`).removeClass ();
		return Promise.resolve ();
	}

	apply () {
		$_(`${Monogatari.selector} [data-ui="background"]`).style ('background-image', 'initial');
		$_(`${Monogatari.selector} [data-ui="background"]`).style ('background-color', 'initial');
		$_(`${Monogatari.selector} [data-ui="background"]`).style (this.property, this.value);

		for (const newClass of this.classes) {
			$_(`${Monogatari.selector} [data-ui="background"]`).addClass (newClass);
		}
		return Promise.resolve ();
	}

	didApply () {
		Monogatari.state ({
			scene: this._statement
		});
		Monogatari.history ('scene').push (this._statement);

		Monogatari.action ('Dialog').reset ();
		return Promise.resolve (true);
	}

	willRevert () {
		$_(`${Monogatari.selector} [data-character]`).remove ();
		$_(`${Monogatari.selector} [data-image]`).remove ();
		$_(`${Monogatari.selector} [data-ui="background"]`).removeClass ();
		return Promise.resolve ();
	}

	revert () {
		Monogatari.history ('scene').pop ();

		if (Monogatari.history ('scene').length > 0) {
			const last = Monogatari.history ('scene')[Monogatari.history ('scene').length - 1];
			this.constructor (last.split (' '));

			$_(`${Monogatari.selector} [data-ui="background"]`).style ('background-image', 'initial');
			$_(`${Monogatari.selector} [data-ui="background"]`).style ('background-color', 'initial');
			$_(`${Monogatari.selector} [data-ui="background"]`).style (this.property, this.value);

			for (const newClass of this.classes) {
				$_(`${Monogatari.selector} [data-ui="background"]`).addClass (newClass);
			}

			Monogatari.state ({
				scene: last
			});

			if (Monogatari.history ('sceneElements').length > 0) {
				const scene_elements = Monogatari.history  ('sceneElements').pop ();

				if (typeof scene_elements === 'object') {
					for (const element of scene_elements) {
						$_(`${Monogatari.selector} #game`).append (element);
					}
				}
			}
			Monogatari.action ('Dialog').reset ();
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Scene.id = 'Scene';

Monogatari.registerAction (Scene);