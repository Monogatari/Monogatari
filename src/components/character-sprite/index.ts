import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';

/**
 * Character definition for sprite rendering
 */
export interface CharacterDefinition {
	layers: string[];
	layer_assets?: Record<string, Record<string, string>>;
}

/**
 * Layer state configuration
 */
export interface LayerState {
	asset: string;
	classes: string[];
}

/**
 * Props for CharacterSprite component
 */
export interface CharacterSpriteProps extends Properties {
	character: CharacterDefinition | string;
	src: string;
	directory: string;
	width: number;
	height: number;
	ratio: number;
}

/**
 * State for CharacterSprite component
 */
export interface CharacterSpriteState extends Properties {
	layers: Record<string, LayerState | null>;
}

class CharacterSprite extends Component<CharacterSpriteProps, CharacterSpriteState> {
	static override tag = 'character-sprite';

	private _resizeHandler: (() => void) | null = null;

	constructor() {
		super();

		this.props = {
			character: '',
			src: '',
			directory: '',
			width: 0,
			height: 0,
			ratio: 0
		};

		this.state = {
			layers: {}
		};
	}

	override onStateUpdate(property: string, _oldValue: unknown, _newValue: unknown): Promise<void> {
		if (property === 'layers') {
			return this.forceRender().then(() => {
				this.resize();
				return Promise.resolve();
			});
		}

		return Promise.resolve();
	}

	override onPropsUpdate(property: string, _oldValue: unknown, newValue: unknown, _oldObject: CharacterSpriteProps, newObject: CharacterSpriteProps): Promise<void> {
		if (property === 'src') {
			if (typeof newValue === 'string' && newValue.trim() !== '') {
				const img = document.createElement('img');
				img.src = newValue;

				this.element().find('img:not(:first-child)').each((element) => {
					element.remove();
				});

				const firstImg = this.element().find('img').get(0);
				if (firstImg) {
					firstImg.setAttribute('src', newValue);
				}
			}
		}

		if (property === 'width' || property === 'height') {
			const { height, width } = newObject;
			this.content('wrapper').style({
				height: `max(${height}px, 80vh)`,
				width: `max(${width}px, 80vh)`
			});
		}

		return Promise.resolve();
	}

	override willMount(): Promise<void> {
		return Promise.resolve();
	}

	override didMount(): Promise<void> {
		this._resizeHandler = () => {
			this.resize();
		};
		window.addEventListener('resize', this._resizeHandler);

		this.resize();

		return Promise.resolve();
	}

	override willUnmount(): Promise<void> {
		if (this._resizeHandler) {
			window.removeEventListener('resize', this._resizeHandler);
			this._resizeHandler = null;
		}
		return Promise.resolve();
	}

	resize(): void {
		const { width, height, ratio } = this.props;

		const actualHeight = parseInt(getComputedStyle(this).height.replace('px', ''));
		const realWidth = actualHeight * ratio;

		this.content('wrapper').style({
			width: `${realWidth}px`
		});

		this.content('wrapper').find('[data-layer]').each((layer) => {
			const layerEl = layer as HTMLImageElement;
			layerEl.onload = () => {
				if (layerEl.naturalWidth !== width) {
					layerEl.style.width = `${(layerEl.naturalWidth * realWidth) / width}px`;
				}

				if (layerEl.naturalHeight !== height) {
					layerEl.style.height = 'auto';
				}
			};
		});
	}

	override render(): Promise<string> {
		const { character, directory } = this.props;

		if (typeof character === 'string') {
			return Promise.resolve('<div data-content="wrapper"></div>');
		}

		const promises: Promise<{ layer: string; image: HTMLImageElement; classes: string[]; sprite: string }>[] = [];

		for (const layer of character.layers) {
			const localLayer = this.state.layers[layer];

			if (typeof localLayer === 'object' && localLayer !== null) {
				const { classes } = localLayer;
				let asset: string = localLayer.asset;

				if (typeof character.layer_assets === 'object' && character.layer_assets !== null) {
					const layerAssets = character.layer_assets[layer];

					if (typeof layerAssets === 'object' && layerAssets !== null) {
						if (typeof layerAssets[asset] === 'string') {
							asset = layerAssets[asset];
						}
					}
				}

				if (typeof asset === 'string') {
					promises.push(new Promise((resolve) => {
						const image = new Image();

						image.src = `${directory}${asset}`;

						image.onload = function() {
							resolve({ layer, image, classes, sprite: localLayer.asset });
						};
					}));
				}
			}
		}

		return Promise.all(promises).then((assets) => {
			return new Promise((resolve) => {
				const wrapper = document.createElement('div');
				wrapper.dataset.content = 'wrapper';

				let maxHeight = 0;
				let maxWidth = 0;

				for (const asset of assets) {
					const { image, layer, classes, sprite } = asset;

					const height = image.naturalHeight;
					const width = image.naturalWidth;

					if (height > maxHeight) {
						maxHeight = height;
					}

					if (width > maxWidth) {
						maxWidth = width;
					}

					image.style.zIndex = String(character.layers.indexOf(layer));
					image.dataset.layer = layer;
					image.dataset.sprite = sprite;

					image.classList.add(...classes);

					wrapper.appendChild(image);
				}

				this.setProps({
					ratio: maxWidth / maxHeight,
					height: maxHeight,
					width: maxWidth
				});

				wrapper.style.height = `${maxHeight}px`;

				resolve(wrapper.outerHTML);
			});
		});
	}
}

export default CharacterSprite;

