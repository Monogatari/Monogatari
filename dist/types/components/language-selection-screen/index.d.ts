import type { Properties } from '@aegis-framework/pandora';
import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';
/**
 * Props for LanguageSelectionScreen component
 */
export interface LanguageSelectionScreenProps extends Properties {
    languages: string[];
    timeout: number;
}
/**
 * State for LanguageSelectionScreen component
 */
export interface LanguageSelectionScreenState extends ScreenState {
    index: number;
}
declare class LanguageSelectionScreen extends ScreenComponent<LanguageSelectionScreenProps, LanguageSelectionScreenState> {
    static tag: string;
    private timer;
    constructor();
    onStateUpdate(property: string, oldValue: unknown, newValue: unknown): Promise<void>;
    didMount(): Promise<void>;
    willUnmount(): Promise<void>;
    render(): string;
}
export default LanguageSelectionScreen;
//# sourceMappingURL=index.d.ts.map