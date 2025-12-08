import { ScreenComponent } from '../../lib/ScreenComponent';

class GameScreen extends ScreenComponent {
	static override shouldProceed (): Promise<unknown[]> {

		if ((this.engine as any).element().find('[data-screen="game"]').isVisible()) {
			return Promise.resolve([]);
		}
		return Promise.reject('Game screen is not visible.');
	}

	static override bind (_selector?: string): Promise<void> {
		const self = this;

		const engine = this.engine as any;

		engine.on('click', '[data-screen="game"] *:not([data-choice])', function () {
			engine.debug.debug('Next Statement Listener');
			engine.proceed({ userInitiated: true, skip: false, autoPlay: false }).then(() => {
				// Nothing to do here
			}).catch((e: unknown) => {
				engine.debug.log(`Proceed Prevented\nReason: ${e}`);
			});
		});

		if (engine.setting('AllowRollback') === true) {
			engine.registerListener('back', {
				keys: 'left',
				callback: () => {
					engine.global('block', false);
					engine.rollback().then(() => {
						// Nothing to do here
					}).catch((e: unknown) => {
						(self.engine as any).debug.log(`Proceed Prevented\nReason: ${e}`);
					});
				}
			});
		}

		return Promise.resolve();
	}

	didMount (): Promise<void> {

		(this.engine as any).on('didUpdateState', ({ detail: { newState: { label } } }: { detail: { newState: { label?: string } } }) => {
			if (label) {
				this.element().data('label', label);
			}
		});

		return Promise.resolve();
	}

	render (): string {
		return `
			<div data-content="visuals">
				<div id="tsparticles" data-ui="particles"></div>
				<div id="background" data-ui="background"></div>
			</div>
		`;
	}
}

GameScreen.tag = 'game-screen';

export default GameScreen;
