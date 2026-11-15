import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Notify extends Action {
    static id: string;
    static blocking: boolean;
    static _configuration: {
        notifications: Record<string, any>;
    };
    static shouldProceed(): Promise<void>;
    static willRollback(): Promise<void>;
    static matchString([show, type]: string[]): boolean;
    static notifications(object?: Record<string, any> | string | null): any;
    hasPermission: boolean;
    notification: any;
    time: number | undefined;
    constructor([show, type, name, time]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Notify;
//# sourceMappingURL=Notify.d.ts.map