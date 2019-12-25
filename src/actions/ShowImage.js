import { Action } from './../lib/Action';
import { $_ } from '@aegis-framework/artemis';

export class ShowImage extends Action {

	static setup () {
		this.engine.history ('image');
		this.engine.state ({
			images: []
		});
		return Promise.resolve ();
	}

	static reset () {
		this.engine.element ().find ('[data-screen="game"] [data-image]').remove ();

		this.engine.state ({
			images: []
		});

		return Promise.resolve ();
	}

	static onLoad () {
		const { images } = this.engine.state ();
		const promises = [];

		for (const item of images) {
			promises.push (this.engine.run (item, false));
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			this.engine.history ('image').pop ();
		}

		if (promises.length > 0) {
			return Promise.all (promises);
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

		if (typeof this.engine.asset ('images', asset) !== 'undefined') {
			this.image = this.engine.asset ('images', asset);
		} else {
			this.image = asset;
		}
	}

	apply () {

		const image = document.createElement ('img');
		$_(image).attribute ('src', `${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').images}/${this.image}`);
		$_(image).addClass ('animated');
		$_(image).data ('image', this.asset);

		for (const className of this.classes) {
			$_(image).addClass (className);
		}

		const durationPosition = this.classes.indexOf ('duration');

		if (durationPosition > -1) {
			$_(image).style ('animation-duration', this.classes[durationPosition + 1]);
		}

		this.engine.element ().find ('[data-screen="game"] [data-content="visuals"]').append (image.outerHTML);

		return Promise.resolve ();
	}

	didApply () {
		this.engine.history ('image').push (this._statement);
		this.engine.state ({
			images: [this._statement, ...this.engine.state ('images')]
		});
		return Promise.resolve ({ advance: true });
	}

	revert () {
		this.engine.element ().find (`[data-image="${this.asset}"]`).remove ();
		this.engine.history ('image').pop ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

ShowImage.id = 'Show::Image';

export default ShowImage;