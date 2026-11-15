import type { VisualNovelEngine } from '../lib/types/Monogatari';
import type { Character } from '../lib/types';
export declare function characters(engine: VisualNovelEngine, object?: Record<string, Character> | null): Record<string, Character>;
export declare function character(engine: VisualNovelEngine, id: string, object?: Partial<Character> | null): Character | undefined;
//# sourceMappingURL=characters.d.ts.map