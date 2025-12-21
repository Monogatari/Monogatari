import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
import { Registry } from '@aegis-framework/pandora';

export class Gallery extends Action {

	static override id = 'Gallery';

  mode: 'unlock' | 'lock';
	asset: string;

	static override matchString([action]: string[]): boolean {
		return action === 'gallery';
	}

	constructor([action, mode, asset]: ['gallery', 'unlock' | 'lock', string]) {
		super();
		this.mode = mode;
		this.asset = asset;
	}

	override async apply(): Promise<void> {
    Registry.instances('gallery-screen', (instance: any) => {
      const unlocked = this.mode === 'unlock' ? [...instance.state.unlocked, this.asset] : instance.state.unlocked.filter((item: string) => item !== this.asset);
      instance.setState({ unlocked });
    });
	}

	override async didApply(): Promise<ActionApplyResult> {
		return { advance: true };
	}

	override async revert(): Promise<void> {
		this.mode = this.mode === 'lock' ? 'unlock' : 'lock';
    await this.apply();
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Gallery;