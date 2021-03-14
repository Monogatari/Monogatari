import { Component } from './../../lib/Component';

class CharacterSprite extends Component {

	constructor () {
		super ();

		this.props = {
			layers: [],
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

	onStateUpdate (property, oldValue, newValue) {
		return Promise.resolve ();
	}

	onPropsUpdate (property, oldValue, newValue, oldObject, newObject) {
		if (property === 'src') {
			this.element ().find ('img').setAttribute ('src', newValue);
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
		this.resize();
		window.addEventListener('resize', () => {
			this.resize();
		});
		return Promise.resolve ();
	}

	resize () {
		const { width, height, ratio } = this.props;

		const actualHeight = parseInt (getComputedStyle(this).height.replace('px', ''));
		const realWidth = actualHeight * ratio;
		this.content('wrapper').style({ width: `${realWidth}px` });
	}

	render () {
		const { character, directory } = this.props;

		const promises = [];

		for (const layer of character.layers) {
			let asset = this.state.layers[layer];

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
						resolve({ layer, image: this });
					};
				}));
			}

		}

		return Promise.all(promises).then ((assets) => {
			return new Promise((resolve, reject) => {
				const wrapper = document.createElement('div');
				wrapper.dataset.content = 'wrapper';

				let maxHeight = 0;
				let maxWidth = 0;

				for (const asset of assets) {
					const { image, layer } = asset;

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