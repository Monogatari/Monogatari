import * as Monogatari from './index.js';

Object.defineProperty(window, 'Monogatari', {
	get () {
		return Monogatari;
	}
});