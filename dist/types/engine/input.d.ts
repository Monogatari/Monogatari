import type { VisualNovelEngine } from '../lib/types/Monogatari';
import type { DOM } from '@aegis-framework/artemis';
export declare function keyboardShortcut(engine: VisualNovelEngine, shortcut: string | string[], callback: (this: VisualNovelEngine, event: KeyboardEvent, element: DOM) => void): void;
export declare function registerListener(engine: VisualNovelEngine, name: string, listener: {
    keys?: string | string[];
    callback: (this: VisualNovelEngine, event: Event, element: DOM) => unknown;
}, replace?: boolean): void;
export declare function unregisterListener(engine: VisualNovelEngine, name: string): void;
export declare function runListener(engine: VisualNovelEngine, name: string, event?: Event | null, element?: DOM | null): Promise<void>;
//# sourceMappingURL=input.d.ts.map