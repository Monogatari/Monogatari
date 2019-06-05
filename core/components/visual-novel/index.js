import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';

class VisualNovel extends Component {

	static shouldRollback () {
		return Promise.resolve ();
	}

	static willRollback () {
		return Promise.resolve ();
	}

}

VisualNovel.tag = 'visual-novel';

Monogatari.registerComponent (VisualNovel);