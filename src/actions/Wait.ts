import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class Wait extends Action {
  static override id = 'Wait';

  static override blocking = false;

  static override matchString([action]: string[]): boolean {
    return action === 'wait';
  }

  static override async shouldProceed(_options?: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean; }): Promise<void> {
    if (this.blocking) {
      throw new Error('Wait period has not ended');
    }
  }

  // TODO: Haven't decided if this is really necesary but sort of makes sense
  static override async willRollback(): Promise<void> {
    Wait.blocking = false;
  }

  // When null, we wait for the click instead of a specific amount of time
  time: number | null = null;

  constructor([action, time]: string[]) {
    super();

    this.time = !isNaN(Number(time)) ? parseInt(time) : null;
  }

  override async apply(): Promise<void> {
    if (typeof this.time !== 'number') {
      return;
    }

    return new Promise<void>((resolve) => {
      Wait.blocking = true;

      setTimeout(() => {
        Wait.blocking = false;
        resolve();
      }, this.time!);
    });
  }

  override async didApply(): Promise<ActionApplyResult> {
    return { advance: typeof this.time === 'number' };
  }

  override async didRevert(): Promise<ActionRevertResult> {
    return { advance: true, step: true };
  }
}

export default Wait;