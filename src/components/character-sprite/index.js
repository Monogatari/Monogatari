import { Component } from './../../lib/Component';

class CharacterSprite extends Component {

	constructor () {
		super ();

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

	onStateUpdate (property, oldValue, newValue, oldState, newState) {
		if (property === 'layers') {
			// const differences = {};
			// for (const [key, value] of Object.entries(newState)) {
			// 	if (value !== oldState[key]) {
			// 		differences[key] = value;
			// 	}
			// }
			// this.resize ();
			return this.forceRender().then(() => {
				this.resize();
				return Promise.resolve();
			});
			//this.resize();
		}


		return Promise.resolve ();
	}


	onPropsUpdate (property, oldValue, newValue, oldObject, newObject) {
		if (property === 'src') {
			if (typeof newValue === 'string' && newValue.trim() !== '') {
				const img = document.createElement('img');

				img.src = newValue;


				this.element ().find ('img:not(:first-child)').each((element) => {
					element.remove();
				});

				this.element ().find ('img').get(0).setAttribute ('src', newValue);
			}
		}

		if (property === 'width' || property === 'height') {
			const { height, width } = newObject;
			this.content('wrapper').style({
				height: `max(${height}px, 80vh)`,
				width: `max(${width}px, 80vh)`
			});
		}

		return Promise.resolve ();
	}

	willMount () {
		return Promise.resolve ();
	}

	didMount () {
		window.addEventListener('resize', () => {
			this.resize();
		});

		this.resize();

		return Promise.resolve ();
	}

	resize () {
		const { width, height, ratio } = this.props;

		const actualHeight = parseInt (getComputedStyle(this).height.replace('px', ''));
		const realWidth = actualHeight * ratio;

		this.content('wrapper').style({
			width: `${realWidth}px`
		});

		this.content('wrapper').find('[data-layer]').each((layer) => {
			layer.onload = () => {
				if (layer.naturalWidth !== width) {
					layer.style.width = `${(layer.naturalWidth * realWidth) / width}px`;
				}

				if (layer.naturalHeight !== height) {
					layer.style.height = 'auto';
				}
			};
		});
	}

	render () {
		const { character, directory } = this.props;

		const promises = [];

		for (const layer of character.layers) {
			const localLayer = this.state.layers[layer];

			if (typeof localLayer === 'object' && localLayer !== null) {
				const { classes } = localLayer;
				let { asset } = localLayer;

				if (typeof character.layer_assets === 'object' && character.layer_assets !== null) {
					const layerAssets = character.layer_assets[layer];


					if (typeof layerAssets === 'object' && layerAssets !== null) {
						if (typeof layerAssets[asset] === 'string') {
							asset = layerAssets[asset];
						}
					}
				}

				if (typeof asset === 'string') {
					promises.push(new Promise((resolve, reject) => {
						const image = new Image ();

						image.src = `${directory}${asset}`;

						image.onload = function () {
							resolve({ layer, image: this, classes, sprite: localLayer.asset });
						};
					}));
				}
			}
		}

		return Promise.all(promises).then ((assets) => {
			return new Promise((resolve, reject) => {
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

					image.style.zIndex = character.layers.indexOf(layer);
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

CharacterSprite.tag = 'character-sprite';



export default CharacterSprite;
