import type Monogatari from '../../monogatari';
import type { Configuration } from './index';
import type { SaveSlot } from './index';
import type { ActionRunContext } from './index';
import type { ActionRevertContext } from './index';
import type { ActionApplyResult } from './index';
import type { ActionRevertResult } from './index';

export interface StaticAction {
  id: string;

  _experimental: boolean;
  _configuration: Configuration;
  loadingOrder: number;

  engine: typeof Monogatari;

  // Lifecycle static methods
  setup: (...args: any[]) => Promise<void>;
  bind: (...args: any[]) => Promise<void>;
  init: (...args: any[]) => Promise<void>;
  onStart: () => Promise<void>;
  onLoad: () => Promise<void>;
  onSave: (slot?: SaveSlot) => Promise<void>;
  reset: (options?: unknown) => Promise<void>;

  // Proceed/Rollback hooks
  shouldProceed: (options?: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean }) => Promise<void>;
  willProceed: () => Promise<void>;
  shouldRollback: () => Promise<void>;
  willRollback: () => Promise<void>;

  // Matching methods
  match: (statement: unknown) => boolean;
  matchString: (statement: string[]) => boolean;
  matchObject: (statement: Record<string, unknown>) => boolean;

  // Run hooks
  beforeRun: (context: ActionRunContext) => Promise<void>;
  afterRun: (context: ActionRunContext) => Promise<void>;
  beforeRevert: (context: ActionRevertContext) => Promise<void>;
  afterRevert: (context: ActionRevertContext) => Promise<void>;



  // Constructor - permissive to allow various action constructor signatures
  new (...args: any[]): any;
}

export interface ActionInstance extends StaticAction {
  // The original statement this action was instantiated with
  _statement: string | string[] | Record<string, unknown> | ((...args: unknown[]) => unknown) | undefined;

  // Current cycle: 'Application' or 'Revert'
  _cycle: 'Application' | 'Revert' | undefined;

  // Extra context passed to the action
  _extras: Record<string, unknown> | undefined;

  context: typeof Monogatari | undefined; // TODO: Same as engine?

  engine: typeof Monogatari;

  setContext: (context: typeof Monogatari) => void;
  _setStatement: (statement: string | Record<string, unknown> | ((...args: unknown[]) => unknown)) => void;
  _setCycle: (cycle: 'Application' | 'Revert') => void;
  setExtras: (extras: Record<string, unknown>) => void;

   // Apply hooks
  willApply: () => Promise<void>;
  apply: (options?: { updateLog?: boolean; updateHistory?: boolean; updateState?: boolean }) => Promise<void>;
  didApply: (options?: { updateHistory?: boolean; updateState?: boolean }) => Promise<ActionApplyResult>;

   // Revert hooks
   willRevert: () => Promise<void>;
   revert: () => Promise<void>;
   didRevert: (options?: { updateHistory?: boolean; updateState?: boolean }) => Promise<ActionRevertResult>;

   interrupt: () => Promise<void>;

}