import type { Properties } from '@aegis-framework/pandora';
import { $_ } from '@aegis-framework/artemis';
import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';

/**
 * State for GalleryScreen component
 */
export interface GalleryScreenState extends ScreenState {
	unlocked: string[];
}

class GalleryScreen extends ScreenComponent<Properties, GalleryScreenState> {
	static override tag = 'gallery-screen';

	static override bind(): Promise<void> {
		// Now lets make it so that when a player clicks on one of the Images
		// of the gallery, the image gets shown. For that purpose, we'll use
		// create a function showImage(). You may notice we are not using a simple
		// $_().click function, instead we are using the 'on' function, this is
		// due to the images being generated automatically, we can't simply
		// attach the listener to them so we attach it to their parent (the
		// gallery) and then check if the click was actually on an image.
		const self = this;
		this.instances().on('click', '[data-image]', function(this: HTMLElement) {
			const image = $_(this).closest('[data-image]').data('image') as string | undefined;
			if (image) {
				self.showImage(image);
			}
		});

		// This listener will make it so that any click on the image viewer
		// closes it
		this.instances().on('click', '[data-ui="image-viewer"]', () => {
			this.instances().find('[data-ui="image-viewer"]').removeClass('modal--active');
			this.instances().find('[data-ui="image-viewer"] figure').style('background-image', '');
		});
		return Promise.resolve();
	}

	static override init(): Promise<void> {
		if (Object.keys(this.engine.assets('gallery') ?? {}).length > 0) {
			const mainMenu = this.engine.component('main-menu') as (typeof import('../../lib/MenuComponent').MenuComponent) | undefined;
			if (mainMenu && 'addButton' in mainMenu) {
				(mainMenu as any).addButton({
					string: 'Gallery',
					icon: '',
					data: {
						action: 'open-screen',
						open: 'gallery'
					}
				});
			}
		} else {
			// Hide Gallery if there are no images defined.
			this.instances().remove();
		}

		return Promise.resolve();
	}

	// A simple function to show an image, this will activate the image viewer
	// and set the image as a background for it.
	static showImage(image: string): void {
		const assetsPath = this.engine.setting('AssetsPath') as { root: string; gallery: string };
		const directory = `${assetsPath.root}/${assetsPath.gallery}/`;
		this.instances().find('[data-ui="image-viewer"] figure').style('background-image', `url('${directory}${this.engine.asset('gallery', image)}')`);
		this.instances().find('[data-ui="image-viewer"]').addClass('modal--active');
	}

	constructor() {
		super();

		this.state = {
			open: false,
			unlocked: []
		};
	}

	override willMount(): Promise<void> {
		super.willMount();
		return this.engine.Storage.get('gallery').then((data: unknown) => {
			const galleryData = data as { unlocked: string[] } | undefined;
			this.setState({
				unlocked: galleryData?.unlocked ?? []
			});
			return Promise.resolve();
		}).catch(() => {
			return Promise.resolve();
		});
	}

	override onStateUpdate(property: string, oldValue: unknown, newValue: unknown): Promise<void> {
		super.onStateUpdate(property, oldValue, newValue);

		this.engine.Storage.set('gallery', {
			unlocked: this.state.unlocked
		});

		// Update the gallery when an image gets unlocked or locked
		this.forceRender();

		return Promise.resolve();
	}

	override render(): string {
		const galleryAssets = this.engine.assets('gallery') ?? {};
		const assetsPath = this.engine.setting('AssetsPath') as { root: string; gallery: string };
		const images = Object.keys(galleryAssets).map((image) => {
			const directory = `${assetsPath.root}/${assetsPath.gallery}/`;

			// Check if the image has been unlocked or not, if it hasn't then a
			// lock will be shown instead of the image.
			if (this.state.unlocked.includes(image)) {
				return `<figure class='card--depth--2 row__column row__column--6 row__column--tablet--4 row__column--desktop--3 row__column--retina--2' data-image='${image}' style="background-image: url('${directory}${this.engine.asset('gallery', image)}')"></figure>`;
			} else {
				return '<figure class="card--depth--2 row__column row__column--6 row__column--tablet--4 row__column--desktop--3 row__column--retina--2"><span class="fas fa-lock"></span></figure>';
			}
		}).join('');

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

export default GalleryScreen;

