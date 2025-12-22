import Action from './../lib/Action';
import AudioPlayer from './../lib/AudioPlayer';
import { ActionApplyResult, ActionRevertResult, MediaType, MediaStateItem, ActionInstance } from '../lib/types';

export class Stop extends Action {
	static override id = 'Stop';

	static override matchString([action]: string[]): boolean {
		return action === 'stop';
	}

	type: MediaType;
	media: string;
	props: string[];
	player: any;

	constructor([action, type, media, ...props]: string[]) {
		super();

		this.type = type as MediaType;
		this.media = media;
		this.props = props;

		if (typeof media === 'undefined' || media === 'with') {
			this.player = this.engine.mediaPlayers(type);
		} else {
			this.player = this.engine.mediaPlayer(type, media);
		}
	}

	override async willApply(): Promise<void> {
		if (this.player) {
			if (Array.isArray(this.player)) {
				for (const player of this.player) {
					player.loop = false;
				}
			} else {
				this.player.loop = false;
			}
		}
	}

	override async apply(): Promise<void> {
		// Check if the audio should have a fade time
		const fadePosition = this.props.indexOf('fade');

		if (Array.isArray(this.player)) {
			if (fadePosition > -1) {
				const fadeTime = this.props[fadePosition + 1];
				const duration = parseFloat((fadeTime.match(/\d*(\.\d*)?/) as RegExpMatchArray)[0]);
				for (const player of this.player) {
					// Only AudioPlayer has fadeOut, HTMLAudioElement doesn't
					if (player instanceof AudioPlayer) {
						await player.fadeOut(duration);
					}
					this.engine.removeMediaPlayer(this.type, player.dataset.key);
				}
			} else {
				this.engine.removeMediaPlayer(this.type);
			}
		} else {
			if (fadePosition > -1) {
				const fadeTime = this.props[fadePosition + 1];
				const duration = parseFloat((fadeTime.match(/\d*(\.\d*)?/) as RegExpMatchArray)[0]);
				// Only AudioPlayer has fadeOut, HTMLAudioElement doesn't
				if (this.player instanceof AudioPlayer) {
					await this.player.fadeOut(duration);
				}
				this.engine.removeMediaPlayer(this.type, this.media);
			} else {
				this.engine.removeMediaPlayer(this.type, this.media);
			}
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		const currentState = this.engine.state(this.type);

		if (typeof this.media !== 'undefined') {
			const filteredState = currentState.filter((item: MediaStateItem) => {
				if (typeof item.statement === 'string') {
					const [play, type, media] = item.statement.split(' ');
					return !(type === this.type && media === this.media);
				}
				return true;
			});
			this.engine.state({ [this.type]: filteredState });
		} else {
			this.engine.history(this.type).push(currentState);
			this.engine.state({ [this.type]: [] });
		}

		return { advance: true };
	}

	override async revert(): Promise<void> {
		const history = this.engine.history(this.type);

		if (typeof this.media !== 'undefined') {
			for (let i = history.length - 1; i >= 0; i--) {
				const last = history[i];
				if (typeof last === 'string') {
					const [play, type, media] = last.split(' ');

					if (this.type === type && this.media === media) {
						// prepareAction returns typeof Action but actually returns instance
						const action = this.engine.prepareAction(last, { cycle: 'Application' }) as ActionInstance | null;
						if (action) {
							await action.willApply();
							await action.apply();
							await action.didApply({ updateHistory: false, updateState: true });
						}
					}
				}
			}
      return;
		}

    const statements = history.pop();

    if (!statements || typeof statements === 'string') {
      return;
    }

    const promises = [];
    for (const state of statements) {
      // prepareAction returns typeof Action but actually returns instance
      const action = this.engine.prepareAction(state.statement, { cycle: 'Application' }) as ActionInstance | null;
      if (action) {
        const promise = (async () => {
          await action.willApply();
          await (action as any).apply({ paused: state.paused });
          await action.didApply({ updateHistory: false, updateState: true });
        })();

        promises.push(promise);
      }
    }
    await Promise.all(promises);
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Stop;