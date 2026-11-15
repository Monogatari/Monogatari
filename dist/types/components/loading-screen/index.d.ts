import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';
import type { Properties } from '@aegis-framework/pandora';
interface LoadingScreenProps extends Properties {
    max: number;
}
interface LoadingScreenState extends ScreenState {
    progress: number;
}
declare class LoadingScreen extends ScreenComponent<LoadingScreenProps, LoadingScreenState> {
    static tag: string;
    constructor();
    didMount(): Promise<void>;
    onStateUpdate(property: string, oldValue: unknown, newValue: unknown): Promise<void>;
    onPropsUpdate(property: string, _oldValue: unknown, newValue: unknown): Promise<void>;
    render(): string;
}
export default LoadingScreen;
//# sourceMappingURL=index.d.ts.map