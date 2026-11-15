import type { Properties } from '@aegis-framework/pandora';
import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';
/**
 * State for GalleryScreen component
 */
export interface GalleryScreenState extends ScreenState {
    unlocked: string[];
}
declare class GalleryScreen extends ScreenComponent<Properties, GalleryScreenState> {
    static tag: string;
    static bind(): Promise<void>;
    static init(): Promise<void>;
    static showImage(image: string): void;
    constructor();
    willMount(): Promise<void>;
    onStateUpdate(property: string, oldValue: unknown, newValue: unknown): Promise<void>;
    render(): string;
}
export default GalleryScreen;
//# sourceMappingURL=index.d.ts.map