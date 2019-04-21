import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class ShowImage extends Action {

	static setup () {
		Monogatari.history ('image');
		Monogatari.state ({
			images: []
		});
		return Promise.resolve ();
	}

	static reset () {
		Monogatari.element ().find ('[data-screen="game"] [data-image]').remove ();
		return Promise.resolve ();
	}

	static onLoad () {
		const { images } = Monogatari.state ();

		for (const item of images) {
			Monogatari.run (item, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('image').pop ();
		}
		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'image';
	}

	constructor ([ show, type, asset, ...props ]) {
		super ();
		this.asset = asset;

		this.classes = (' ' + props.join (' ')).replace(' at ', ' ').replace (' with ', ' ').trim ().split (' ');

		if (typeof Monogatari.asset ('images', asset) !== 'undefined') {
			this.image = Monogatari.asset ('images', asset);
		} else {
			this.image = asset;
		}
	}

	apply () {

		const image = document.createElement ('img');
		$_(image).attribute ('src', `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').images}/${this.image}`);
		$_(image).addClass ('animated');
		$_(image).data ('image', this.asset);

		for (const className of this.classes) {
			$_(image).addClass (className);
		}

		const durationPosition = this.classes.indexOf ('duration');

		if (durationPosition > -1) {
			$_(image).style ('animation-duration', this.classes[durationPosition + 1]);
		}

		Monogatari.element ().find ('[data-screen="game"] [data-content="visuals"]').append (image.outerHTML);

		return Promise.resolve ();
	}

	didApply () {
		Monogatari.history ('image').push (this._statement);
		Monogatari.state ({
			images: [this._statement, ...Monogatari.state ('images')]
		});
		return Promise.resolve ({ advance: true });
	}

	revert () {
		if (this.classes.length > 0) {
			for (const newClass of this.classes) {
				Monogatari.element ().find (`[data-image="${this.asset}"]`).addClass(newClass);
			}

		} else {
			Monogatari.element ().find (`[data-image="${this.asset}"]`).remove ();
		}
		Monogatari.history ('image').pop ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

ShowImage.id = 'Show::Image';

Monogatari.registerAction (ShowImage);