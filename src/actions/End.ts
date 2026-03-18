import Action from './../lib/Action';
import { getDesktopBridge } from '../lib/DesktopBridge';

export class End extends Action {
  static override id = 'End';

  static override async bind(): Promise<void> {
    this.engine.registerListener('end', {
      keys: 'shift+q',
      callback: () => {
        if (this.engine.global('playing')) {
          this.engine.alert('quit-warning', {
            message: 'Confirm',
            actions: [
              {
                label: 'Quit',
                listener: 'quit'
              },
              {
                label: 'Cancel',
                listener: 'dismiss-alert'
              }
            ]
          });
        }
      }
    });

    this.engine.registerListener('quit', {
      callback: () => {
        this.engine.dismissAlert('quit-warning');

        if (this.engine.global('playing') === true) {
          this.engine.run('end');
          return;
        }

        const bridge = getDesktopBridge();

        if (bridge) {
          bridge.send('quit-request');
        }
      }
    });
  }

  static override matchString([action]: string[]): boolean {
    return action === 'end';
  }

  override async willApply(): Promise<void> {
    this.engine.hideScreens();
  }

  override async apply(): Promise<void> {
    const engine = this.engine;

    engine.global('playing', false);

    engine.resetGame();
    engine.showMainScreen();


    const engineElement = engine.element();

    engineElement.find('[data-component="quick-menu"]').removeClass('splash-screen');
    engineElement.find('[data-component="game-screen"]').removeClass('splash-screen');
  }

  override async willRevert(): Promise<void> {
    throw new Error('End action is not reversible');
  }
}

export default End;