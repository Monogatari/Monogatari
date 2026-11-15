import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
/**
 * Props for MessageModal component
 */
export interface MessageModalProps extends Properties {
    title: string | null;
    subtitle: string | null;
    body: string;
    actionString: string;
}
declare class MessageModal extends Component<MessageModalProps, Properties> {
    static tag: string;
    constructor();
    shouldProceed(): Promise<void>;
    willProceed(): Promise<void>;
    willRollback(): Promise<void>;
    onReset(): Promise<void>;
    willMount(): Promise<void>;
    render(): string;
}
export default MessageModal;
//# sourceMappingURL=index.d.ts.map