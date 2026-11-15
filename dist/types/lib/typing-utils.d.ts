export interface BaseTypedAction {
    action: string;
    n?: string;
}
export interface TypingCallbacks<T> {
    onBegin?: (self: T) => void;
    onStart?: (index: number, self: T) => void;
    onStop?: (index: number, self: T) => void;
    preStringTyped?: (index: number, self: T) => void;
    onStringTyped?: (index: number, self: T) => void;
    onTypingPaused?: (index: number, self: T) => void;
    onTypingResumed?: (index: number, self: T) => void;
    onDestroy?: (self: T) => void;
}
/** Pattern to match whitespace characters */
export declare const WHITESPACE_PATTERN: RegExp;
/** Basic action pattern for {pause:N} and {speed:N} commands */
export declare const BASIC_ACTION_PATTERN: RegExp;
/** Pattern to extract action name and value */
export declare const ACTION_EXTRACT_PATTERN: RegExp;
/**
 * Get all leaf (text) nodes from a DOM tree.
 * Traverses the tree recursively to find nodes with no children.
 *
 * @param node - The root node to start traversal from
 * @returns Array of leaf nodes
 */
export declare function getLeafNodes(node: Node | null): Node[];
/**
 * Parse a string into nodes and actions using the basic action pattern.
 * Creates span elements with visibility:hidden for each character.
 *
 * Supports inline commands:
 * - {speed:N} - Change typing speed to N milliseconds
 * - {pause:N} - Pause for N milliseconds
 *
 * @param curString - The string to parse
 * @returns Tuple of [nodes array, actions array]
 *
 * @example
 * parseBasicString("{speed:10}hello {pause:1000}world!")
 * // Returns nodes for each character and actions at appropriate positions
 */
export declare function parseBasicString(curString: string): [Node[], (BaseTypedAction | undefined)[]];
/**
 * Parse a string into a DocumentFragment for better performance.
 * Same as parseBasicString but returns a DocumentFragment instead of array.
 *
 * @param curString - The string to parse
 * @returns Tuple of [DocumentFragment, actions array]
 */
export declare function parseBasicStringToFragment(curString: string): [DocumentFragment, (BaseTypedAction | undefined)[]];
/**
 * Interface for RAF-based animation timing state.
 */
export interface AnimationTimingState {
    animationFrameId: number | null;
    lastFrameTime: number;
    accumulatedTime: number;
    targetWaitTime: number;
    isAnimating: boolean;
}
/**
 * Create initial animation timing state.
 */
export declare function createAnimationTimingState(): AnimationTimingState;
/**
 * Add humanization (slight randomness) to typing speed.
 *
 * @param speed - Base speed in milliseconds
 * @returns Randomized speed
 */
export declare function humanizeSpeed(speed: number): number;
//# sourceMappingURL=typing-utils.d.ts.map