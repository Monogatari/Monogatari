import Action from './../lib/Action';
import { $_ } from '@aegis-framework/artemis';
import { ActionApplyResult, ActionRevertResult, ActionInstance } from '../lib/types';

export class ShowImage extends Action {

	static override id = 'Show::Image';

	static override async setup(): Promise<void> {
		this.engine.history('image');
		this.engine.state({
			images: []
		});
	}

	static override async reset(): Promise<void> {
		this.engine.element().find('[data-screen="game"] [data-image]').remove();

		this.engine.state({
			images: []
		});
	}

	static override async onLoad(): Promise<void> {
		const images = this.engine.state('images') as string[];
		const promises: Promise<void>[] = [];

		for (const item of images) {
			const action = this.engine.prepareAction(item, { cycle: 'Application' }) as ActionInstance | null;
			if (action !== null) {
				const promise = (async () => {
					await action.willApply();
					await action.apply();
					await action.didApply({ updateHistory: false, updateState: false });
				})();

				promises.push(promise);
			}
		}

		if (promises.length > 0) {
			await Promise.all(promises);
		}
	}

	static override matchString([show, type]: string[]): boolean {
		return show === 'show' && type === 'image';
	}

	asset: string;
	classes: string[];
	image: string;

	constructor([show, type, asset, ...props]: string[]) {
		super();
		this.asset = asset;

		this.classes = (' ' + props.join(' ')).replace(' at ', ' ').replace(' with ', ' ').trim().split(' ');

		const assetPath = this.engine.asset('images', asset);
		if (typeof assetPath !== 'undefined') {
			this.image = assetPath;
		} else {
			this.image = asset;
		}
	}

	override async apply(): Promise<void> {
		const position = (this._statement as string).match(/at\s(\S*)/);
		
		// Check if image is cached
		const cacheKey = `images/${this.asset}`;
		const cachedImage = this.engine.imageCache(cacheKey);
		
		let image: HTMLImageElement;
		if (cachedImage) {
			// Clone the cached image element
			image = cachedImage.cloneNode(true) as HTMLImageElement;
		} else {
			// Create new image element
			image = document.createElement('img');
			$_(image).attribute('src', `${this.engine.setting('AssetsPath').root}/${this.engine.setting('AssetsPath').images}/${this.image}`);
		}

		$_(image).addClass('animated');
		$_(image).data('image', this.asset);

		for (const className of this.classes) {
			if (className) {
				$_(image).addClass(className);
			}
		}

		if (position instanceof Array) {
			// If it was, we'll set that position to the character
			const [at, positionClass] = position;
			$_(image).data('position', positionClass);
		} else {
			$_(image).addClass('center');
			$_(image).data('position', 'center');
		}

		const durationPosition = this.classes.indexOf('duration');

		if (durationPosition > -1) {
			$_(image).style('animation-duration', this.classes[durationPosition + 1]);
		}

		this.engine.element().find('[data-screen="game"] [data-content="visuals"]').append(image.outerHTML);
	}

	override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
		if (updateHistory === true) {
			(this.engine.history('image') as string[]).push(this._statement as string);
		}

		if (updateState === true) {
			this.engine.state({
				images: [...this.engine.state('images'), this._statement as string]
			});
		}
		return { advance: true };
	}

	override async revert(): Promise<void> {
		this.engine.element().find(`[data-image="${this.asset}"]`).remove();
	}

	override async didRevert(): Promise<ActionRevertResult> {
		this.engine.history('image').pop();
		this.engine.state({
			images: [...this.engine.state('images').filter((item: string) => {
				if (typeof item === 'string') {
					const [show, image, asset] = item.split(' ');
					return asset !== this.asset;
				}
				return true;
			})]
		});
		return { advance: true, step: true };
	}
}

export default ShowImage;