import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Scene extends Action {

	static matchString ([ action ]) {
		return action === 'scene';
	}

	constructor ([ action, scene, separator, ...classes ]) {
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
		$_('#game img:not([data-ui="face"]):not([data-visibility="invisible"])').each ((element) => {
			scene_elements.push (element.outerHTML);
		});

		Monogatari.setting ('SceneElementsHistory').push (scene_elements);

		$_('[data-character]').remove ();
		$_('[data-image]').remove ();
		$_('[data-ui="background"]').removeClass ();
		return Promise.resolve ();
	}

	apply () {

		$_('[data-ui="background"]').style (this.property, this.value);

		for (const newClass of this.classes) {
			$_('[data-ui="background"]').addClass (newClass);
		}

		Monogatari.setting ('Scene', this.scene);
		Monogatari.setting ('SceneHistory').push (this.scene);

		Monogatari.whipeText ();

		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	willRevert () {
		$_('[data-character]').remove ();
		$_('[data-image]').remove ();
		$_('[data-ui="background"]').removeClass ();
		return Promise.resolve ();
	}

	revert () {
		Monogatari.setting ('SceneHistory').pop ();
		Monogatari.setting ('Scene', Monogatari.setting ('SceneHistory').slice(-1)[0]);

		$_('[data-ui="background"]').style (this.property, this.value.replace (this.scene, Monogatari.setting ('Scene')));

		if (Monogatari.setting ('SceneElementsHistory').length > 0) {
			const scene_elements = Monogatari.setting ('SceneElementsHistory').pop ();

			if (typeof scene_elements === 'object') {
				for (const element of scene_elements) {
					$_('#game').append (element);
				}
			}
		}
		Monogatari.whipeText();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Scene.id = 'Scene';

Monogatari.registerAction (Scene);