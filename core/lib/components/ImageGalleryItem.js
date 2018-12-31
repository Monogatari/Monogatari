import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class ImageGalleryItem extends Component {

	static html (html = null, ...params) {
		if (html !== null && typeof params === 'undefined') {
			this._html = html;
		} else {
			// Check if additional parameters have been sent to a rendering function
			if (typeof params !== 'undefined' && typeof this._html === 'function') {
				if (html === null) {
					return this._html.call (this, ...params);
				} else {
					return this._html.call (html, ...params);
				}
			}

			// Check if no parameters were set but the HTML is still a function to be called
			if (typeof params === 'undefined' && html === null && typeof this._html === 'function') {
				return this._html.call (this);
			}

			// If this is reached, the HTML was just a string
			return this._html;
		}
	}

	static render (image) {
		return this.html (null, image);
	}
}

ImageGalleryItem._id = 'GALLERY_ITEM';

ImageGalleryItem._html = image => {
	// Check if the image has been unlocked or not, if it hasn't then a
	// lock will be shown instead of the image.
	if (Monogatari.component ('GALLERY').state ('unlocked').includes (image)) {
		return `<figure class='md-depth-2 col xs6 s6 m4 l3 xl3' data-image='${image}' style='background-image: url('./img/gallery/${Monogatari.component ('GALLERY').images (image)}')'></figure>`;
	} else {
		return '<figure class="md-depth-2 column column--col xs6 s6 m4 l3 xl3"><span class="fa fa-lock"></span></figure>';
	}
};

Monogatari.registerComponent (ImageGalleryItem);