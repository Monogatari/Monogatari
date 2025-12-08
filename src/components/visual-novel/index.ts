import { Component } from '../../lib/Component';

class VisualNovel extends Component {
	static override shouldRollback (): Promise<unknown[]> {
		return Promise.resolve([]);
	}

	static override willRollback (): Promise<unknown[]> {
		return Promise.resolve([]);
	}

	render (): string {
		return '';
	}
}

VisualNovel.tag = 'visual-novel';

export default VisualNovel;
