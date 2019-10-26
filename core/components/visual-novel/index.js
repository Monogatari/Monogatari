import { Component } from './../../lib/Component';

class VisualNovel extends Component {

	static shouldRollback () {
		return Promise.resolve ();
	}

	static willRollback () {
		return Promise.resolve ();
	}

	render () {
		return '';
	}

}

VisualNovel.tag = 'visual-novel';


export default VisualNovel;