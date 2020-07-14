import { Component } from './../../lib/Component';

class CharacterSprite extends Component {

	constructor () {
		super ();

		this.props = {
			layers: [],
			src: '',
			directory: '',
		};

		this.state = {
			layers: {},
		};
	}

	onStateUpdate (property, oldValue, newValue) {
		return Promise.resolve ();
	}

	onPropsUpdate (property, oldValue, newValue) {
		if (property === 'src') {
			this.element ().find ('img').setAttribute ('src', newValue);
		}
		return Promise.resolve ();
	}

	willMount () {
		return Promise.resolve ();
	}

	didMount () {
		window.addEventListener('resize', () => {

		});
		return Promise.resolve ();
	}

	render () {
		const promises = [];
		const self = this;
		for (const layer of this.props.layers) {
			promises.push(new Promise((resolve, reject) => {
				const image = new Image ();
				image.src = `${this.props.directory}${this.state.layers[layer]}`;
				image.onload = function () {
					resolve(this);
				};
			}));
		}
		return Promise.all(promises).then ((images) => {
			return new Promise((resolve, reject) => {
				const wrapper = document.createElement('div');
				wrapper.dataset.content = 'wrapper';
				let heightRatio = 1;
				let widthRatio = 1;
				for (const index in images) {
					const image = images[index];

					if (index == 0) {
						const maxHeight = (window.innerHeight * 0.80);
						heightRatio = image.naturalHeight > maxHeight ? maxHeight / image.naturalHeight : 1;

						widthRatio = image.naturalWidth / image.naturalHeight;

						console.log(widthRatio);

						image.height = image.height * heightRatio;
						image.width = image.height * widthRatio;

						console.log(heightRatio, widthRatio, image.height);
						wrapper.style.height = `${image.height}px`;
						wrapper.style.width = `${image.width}px`;

						console.log(wrapper);

					} else {
						image.height = image.height * heightRatio;
					}

					// image.width = image.height * widthRatio;
					image.dataset.layer = this.props.layers[index];

					wrapper.appendChild(image);
				}

				resolve(wrapper.outerHTML);
			});
		});
	}
}

CharacterSprite.tag = 'character-sprite';



export default CharacterSprite;