import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
/**
 * Choice item definition
 */
export interface ChoiceItem {
    Text: string;
    Do: string;
    Class?: string;
    Clickable?: () => boolean | Promise<boolean>;
    _key: string;
}
/**
 * Props for ChoiceContainer component
 */
export interface ChoiceContainerProps extends Properties {
    choices: ChoiceItem[];
    classes: string;
}
declare class ChoiceContainer extends Component<ChoiceContainerProps, Properties> {
    static tag: string;
    constructor();
    shouldProceed(): Promise<void>;
    willRollback(): Promise<void>;
    onReset(): Promise<void>;
    willMount(): Promise<void>;
    didMount(): Promise<void>;
    render(): Promise<string>;
}
export default ChoiceContainer;
//# sourceMappingURL=index.d.ts.map