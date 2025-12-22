import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult, MediaType, MediaStateItem } from '../lib/types';

export class Pause extends Action {

	static override id = 'Pause';

	static override matchString([action]: string[]): boolean {
		return action === 'pause';
	}

	type: MediaType;
	media: string;
	player: any;

	constructor([pause, type, media]: string[]) {
		super();

		this.type = type as MediaType;
		this.media = media;

		if (typeof media === 'undefined') {
			this.player = this.engine.mediaPlayers(type);
		} else {
			this.player = this.engine.mediaPlayer(type, media);
		}
	}

	override async willApply(): Promise<void> {
		if (this.player) {
			return Promise.resolve();
		}
		throw new Error('Media player was not defined.');
	}

	override async apply(): Promise<void> {
		if (Array.isArray(this.player)) {
			for (const player of this.player) {
				player.pause();
			}
		} else {
			this.player.pause();
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		const currentState = this.engine.state(this.type);

		if (Array.isArray(this.player)) {
			const updatedState = currentState.map((s: MediaStateItem) => ({
				...s,
				paused: true
			}));
			this.engine.state({ [this.type]: updatedState });
		} else {
			const updatedState = currentState.map((item: MediaStateItem) => {
				if (typeof item.statement === 'string') {
					const [play, type, media] = item.statement.split(' ');
					// If this.media is undefined, pause all items
					// If this.media is defined, only pause matching items
					if (this.media === undefined || media === this.media) {
						return { ...item, paused: true };
					}
				}
				return item;
			});
			this.engine.state({ [this.type]: updatedState });
		}

		return { advance: true };
	}

	override async willRevert(): Promise<void> {
		if (this.player) {
			return Promise.resolve();
		}

		throw new Error('Media player was not defined.');
	}

	override async revert(): Promise<void> {
		if (Array.isArray(this.player)) {
			const promises = [];
			for (const player of this.player) {
				promises.push(player.play());
			}
			await Promise.all(promises);
		} else {
			await this.player.play();
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		const currentState = this.engine.state(this.type);

		if (Array.isArray(this.player)) {
			const updatedState = currentState.map((s: MediaStateItem) => ({
				...s,
				paused: false
			}));
			this.engine.state({ [this.type]: updatedState });
		} else {
			const updatedState = currentState.map((item: MediaStateItem) => {
				if (typeof item.statement === 'string') {
					const [play, type, media] = item.statement.split(' ');

					// If this.media is undefined, unpause all items
					// If this.media is defined, only unpause matching items
					if (this.media === undefined || media === this.media) {
						return { ...item, paused: false };
					}
				}
				return item;
			});
			this.engine.state({ [this.type]: updatedState });
		}

		return { advance: true, step: true };
	}
}

export default Pause;