import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class ImageGalleryItem extends Component {

	static render (image) {
		return this.html (null, image);
	}
}

ImageGalleryItem._id = 'gallery_screen::item';

ImageGalleryItem._html = image => {
	// Check if the image has been unlocked or not, if it hasn't then a
	// lock will be shown instead of the image.
	if (Monogatari.component ('gallery_screen').state ('unlocked').includes (image)) {
		return `<figure data-component="gallery_screen::item" class='md-depth-2 col xs6 s6 m4 l3 xl3' data-image='${image}' style='background-image: url('./img/gallery/${Monogatari.component ('gallery_screen').images (image)}')'></figure>`;
	} else {
		return '<figure data-component="gallery_screen::item" class="md-depth-2 column column--col xs6 s6 m4 l3 xl3"><span class="fa fa-lock"></span></figure>';
	}
};

Monogatari.registerComponent (ImageGalleryItem);