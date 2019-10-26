import { ScreenComponent } from '../../lib/ScreenComponent';
import { $_ } from '@aegis-framework/artemis';

class GalleryScreen extends ScreenComponent {

	static bind (selector) {

		// Now lets make it so that when a player clicks on one of the Images
		// of the gallery, the image gets shown. For that purpose, we'll use
		// create a function showImage (). You may notice we are not using a simple
		// $_().click function, instead we are using the 'on' function, this is
		// due to the images being generated automatically, we can't simply
		// attach the listerner to them so we attach it to their parent (the
		// gallery) and then check if the click was actually on an image.
		const self = this;
		this.instances ().on ('click', '[data-image]', function () {
			const image = $_(this).closest ('[data-image]').data ('image');
			self.showImage (image);
		});

		// This listener will make it so that any click on the image viewer
		// closes it
		this.instances ().on ('click', '[data-ui="image-viewer"]', () => {
			this.instances ().find ('[data-ui="image-viewer"]').removeClass ('modal--active');
			this.instances ().find ('[data-ui="image-viewer"] figure').style ('background-image', '');
		});
		return Promise.resolve ();
	}

	static init (selector) {
		if (Object.keys (this.engine.assets ('gallery')).length > 0) {
			this.engine.component ('main-menu').addButton ({
				string: 'Gallery',
				data: {
					action: 'open-screen',
					open: 'gallery'
				}
			});
		} else {
			// Hide Gallery if there are no images defined.
			this.instances ().remove ();
		}

		return Promise.resolve ();
	}

	// A simple function to show an image, this will activate the image viewer
	// and set the image as a background for it.
	static showImage (image) {
		const directory = `${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').gallery}/`;
		this.instances ().find ('figure').style ('background-image', `url('${directory}${this.engine.asset ('gallery', image)}')`);
		this.instances ().find ('[data-ui="image-viewer"]').addClass ('modal--active');
	}

	constructor () {
		super ();

		this.state = {
			unlocked: []
		};
	}

	willMount () {
		super.willMount ();
		return this.engine.Storage.get ('gallery').then ((data) => {
			this.setState ({
				unlocked: data.unlocked
			});
			return Promise.resolve ();
		}).catch (() => {
			return Promise.resolve ();
		});
	}

	onStateUpdate (property, oldValue, newValue) {
		super.onStateUpdate (property, oldValue, newValue);

		this.engine.Storage.set ('gallery', {
			unlocked: this.state.unlocked
		});

		// Update the gallery when an image gets unlocked or locked
		this.forceRender ();

		return Promise.resolve ();
	}

	render () {
		const images = Object.keys (this.engine.assets ('gallery')).map ((image) => {
			const directory = `${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').gallery}/`;

			// Check if the image has been unlocked or not, if it hasn't then a
			// lock will be shown instead of the image.
			if (this.state.unlocked.includes (image)) {
				return `<figure class='card--depth--2 row__column row__column--6 row__column--tablet--4 row__column--desktop--3 row__column--retina--2' data-image='${image}' style="background-image: url('${directory}${this.engine.asset ('gallery', image)}')"></figure>`;
			} else {
				return '<figure class="card--depth--2 row__column row__column--6 row__column--tablet--4 row__column--desktop--3 row__column--retina--2"><span class="fas fa-lock"></span></figure>';
			}
		}).join ('');

		return `
			<div class='modal' data-ui="image-viewer">
				<figure class="modal__content"></figure>
			</div>
			<button class='fas fa-arrow-left top left' data-action='back'></button>
			<h2 data-string='Gallery'>Gallery</h2>
			<div class='row row--spaced text--center' data-ui="gallery">
				${images}
			</div>
		`;
	}
}

GalleryScreen.tag = 'gallery-screen';


export default GalleryScreen;