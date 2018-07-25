import { Action } from '../Action';
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
		$_(`${Monogatari.selector} #game [data-image]`).remove ();
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
		return show === 'show', type === 'image';
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
		this.sprite = this.image;
	}

	apply () {

		const object = `<img src="assets/images/${this.image}" class="animated ${this.classes.join (' ')}" data-image="${this.asset}" data-sprite="${this.sprite}">`;
		$_(`${Monogatari.selector} #game`).append (object);
		Monogatari.history ('image').push (object);
		Monogatari.state ({
			images: [this._statement, ...Monogatari.state ('images')]
		});
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	revert () {
		if (this.classes.length > 0) {
			for (const newClass of this.classes) {
				$_(`${Monogatari.selector} [data-image="${this.asset}"]`).addClass(newClass);
			}

		} else {
			$_(`${Monogatari.selector} [data-image="${this.asset}"]`).remove ();
		}
		Monogatari.history ('image').pop ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

ShowImage.id = 'Show::Image';

Monogatari.registerAction (ShowImage);