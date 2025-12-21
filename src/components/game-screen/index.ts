import ScreenComponent from '../../lib/ScreenComponent';

class GameScreen extends ScreenComponent {
	static override async shouldProceed() {
		if (this.engine.element().find('[data-screen="game"]').isVisible()) {
			return;
		}

		throw new Error('Game screen is not visible.');
	}

	static override async bind() {
		const engine = this.engine;

		engine.on('click', '[data-screen="game"] *:not([data-choice])', async () => {
			engine.debug.debug('Next Statement Listener');
      try {
        await engine.proceed({ userInitiated: true, skip: false, autoPlay: false });
      } catch (e: unknown) {
        engine.debug.log(`Click Proceed Prevented\nReason: ${e}`);
      }
		});

		if (engine.setting('AllowRollback') === true) {
			engine.registerListener('back', {
				keys: 'left',
				callback: async () => {
					engine.global('block', false);
					try {
						await engine.rollback();
					} catch (e: unknown) {
						engine.debug.log(`Rollback Prevented\nReason: ${e}`);
					}
				}
			});
		}
	}

	async didMount (): Promise<void> {
		this.engine.on('didUpdateState', (event: Event) => {
      const { detail: { newState: { label } } } = event as CustomEvent<{ newState: { label?: string } }>;

			if (label) {
				this.element().data('label', label);
			}
		});
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
