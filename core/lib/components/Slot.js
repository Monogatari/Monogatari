import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { Text } from '@aegis-framework/artemis';
import moment from 'moment';

class Slot extends Component {

	static render (slot, name, image, data) {
		return this.html (null, slot, name, image, data);
	}
}

Slot._id = 'slot';

Slot._html = (slot, name, image, data) => {
	let background = '';

	if (image) {
		background = `url(${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').scenes}/${image})`;
	} else if (data.game.state.scene) {
		background = data.game.state.scene;

		if (background.indexOf (' with ') > -1) {
			background = Text.suffix ('show scene', Text.prefix (' with ', background));
		}
	}

	return `
		<figure data-component="slot" data-slot='${slot}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
			<button class='fas fa-times' data-delete='${slot}'></button>
			<small class='badge'>${name}</small>
			<div data-content="background" style="${image ? 'background-image' : 'background'}: ${background}"></div>
			<figcaption>${moment (data.date).format ('MMMM Do YYYY, h:mm:ss a')}</figcaption>
		</figure>
	`;
};

Monogatari.registerComponent (Slot);