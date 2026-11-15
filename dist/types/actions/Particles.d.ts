import Action from '../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Particles extends Action {
    static id: string;
    static _configuration: {
        particles: Record<string, any>;
    };
    static stop(): void;
    static setup(): Promise<void>;
    static reset(): Promise<void>;
    static onLoad(): Promise<void>;
    static matchString([show, type]: string[]): boolean;
    static particles(object?: Record<string, any> | string | null): any;
    particles: any;
    name: string | undefined;
    constructor([show, type, name]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply({ updateHistory, updateState }?: {
        updateHistory?: boolean | undefined;
        updateState?: boolean | undefined;
    }): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Particles;
//# sourceMappingURL=Particles.d.ts.map