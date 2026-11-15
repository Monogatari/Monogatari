import Action from './../lib/Action';
import { ActionRevertResult } from '../lib/types';
export declare class Message extends Action {
    static id: string;
    static blocking: boolean;
    static _configuration: any;
    static bind(): Promise<void>;
    static shouldProceed(_options?: {
        userInitiated?: boolean;
        skip?: boolean;
        autoPlay?: boolean;
    }): Promise<void>;
    static willRollback(): Promise<void>;
    static matchString([show, type]: string[]): boolean;
    static messages(object?: any): any;
    id: string;
    message: any;
    classes: string[];
    constructor([show, type, message, ...classes]: string[]);
    willApply(): Promise<void>;
    apply(): Promise<void>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Message;
//# sourceMappingURL=Message.d.ts.map