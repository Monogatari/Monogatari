import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';
import type TypeCharacter from '../type-character/index';
import { type TypingCallbacks } from '../../lib/typing-utils';
export type ActionType = 'number' | 'enclosed' | 'instance';
export interface TypeWriterAction {
    name: string;
    type: ActionType;
    action: (this: TypeWriter, ...args: unknown[]) => void;
}
export interface TypeWriterActions {
    [key: string]: TypeWriterAction;
}
export interface TypeWriterConfiguration {
    actions: TypeWriterActions;
    [key: string]: unknown;
}
export interface TypedConfig extends TypingCallbacks<TypeWriter> {
    typeSpeed?: number;
    loop?: boolean | number;
    showCursor?: boolean;
    hideCursorOnEnd?: boolean;
    preStringTyped: (index: number, self: TypeWriter) => void;
    onStringTyped: (index: number, self: TypeWriter) => void;
    onStringLoop?: (index: number, self: TypeWriter) => void;
}
export interface ParsedAction {
    action: string;
    n?: string;
    options?: Record<string, string> | string[];
    text?: string;
    id?: string;
}
export interface VoidElementResult {
    props: Record<string, boolean>;
    state: Record<string, unknown>;
    node: TypeCharacter;
}
export interface TypeWriterProps extends Properties {
    string: string | false;
    typeSpeed?: number;
    loop?: boolean | number;
    showCursor?: boolean;
    hideCursorOnEnd?: boolean;
    delay?: number;
    start?: boolean;
}
export interface TypeWriterState extends Properties {
    config: Partial<TypedConfig>;
    strings: string[];
    cursor: Record<string, string>;
    ignore?: boolean;
    special?: Record<string, boolean>;
}
export declare const QUOTED_VALUE_PATTERN: RegExp;
export declare const CSS_VALUE_PATTERN: RegExp;
export declare const QUOTE_CONTENT_PATTERN: RegExp;
declare class TypeWriter extends Component<TypeWriterProps, TypeWriterState> {
    static tag: string;
    static _patternCacheVersion: number;
    static _numberActionsCache: string | null;
    static _enclosedActionsCache: string | null;
    static _instanceActionsCache: string | null;
    static _configuration: TypeWriterConfiguration;
    typeSpeed: number;
    speed: number;
    nextPause: number | null;
    stringPos: number;
    loops: boolean | number;
    stopLoop: boolean;
    nodeCounter: number;
    enclosedID: string[];
    parseIndex: number;
    actionsPlayed: number;
    actions: (ParsedAction | undefined)[];
    elements: NodeListOf<TypeCharacter> | null;
    ignorePause?: boolean;
    private _animationFrameId;
    private _lastFrameTime;
    private _accumulatedTime;
    private _targetWaitTime;
    private _isAnimating;
    private _actionPatternCache;
    private _numberActionsCache;
    private _enclosedActionsCache;
    private _instanceActionsCache;
    private _patternCacheVersion;
    constructor();
    static configuration(object?: string | TypeWriterConfiguration | null): TypeWriterConfiguration | unknown;
    static actions(): TypeWriterActions;
    /**
     * Strip all TypeWriter action markers from a string.
     * This dynamically handles all registered actions (number, enclosed, instance types).
     *
     * @param str - The string to strip markers from
     * @returns The string with all action markers removed
     */
    static stripActionMarkers(str: string): string;
    /**
     * Get a specific action or add a new one to the actions config.
     * Note: Adding a new action invalidates the pattern cache for all instances.
     */
    static action(action?: string | TypeWriterAction | null): TypeWriterAction | TypeWriterActions;
    /**
     * Invalidate the pattern cache for all TypeWriter instances.
     * Called when new actions are registered.
     */
    private static _invalidateAllPatternCaches;
    /**
     * Get the current pattern cache version.
     */
    static get patternCacheVersion(): number;
    /**
     * Get all strings.
     */
    get strings(): string[];
    /**
     * Build and cache the action pattern regex for better performance.
     */
    private _buildActionPatterns;
    /**
     * Start the typing animation with a fresh configuration.
     */
    initiate(): void;
    /**
     * Check for non-enclosing html tags and return properties for them.
     */
    checkVoidTags(element: Node): VoidElementResult | false;
    /**
     * Setup the current string with the proper elements to run the typing animation.
     * Uses DocumentFragment for batched DOM operations.
     */
    setDisplay(curString: string): void;
    /**
     * Stop the typing animation.
     */
    stop(): void;
    /**
     * Finish the typing animation immediately, showing all remaining text.
     *
     * @param instant - If true, immediately show full text without animation.
     *                  If false, rush through at maximum speed.
     */
    finish(instant?: boolean): void;
    /**
     * Set content to display, with optional typing animation.
     * This is the primary API for displaying text in the TypeWriter.
     *
     * @param text - The text to display (may include TypeWriter action markers)
     * @param animate - If true, animate the text. If false, show instantly.
     *                  Also respects the global TypeAnimation setting.
     */
    setContent(text: string, animate?: boolean): void;
    /**
     * Start the typing animation again.
     */
    start(): void;
    /**
     * Parse through the current string and return a DocumentFragment with type-character elements.
     * Uses DocumentFragment for better performance with batch DOM operations.
     */
    parseStringToFragment(curString: string, voidCount: number): [DocumentFragment, (ParsedAction | undefined)[]];
    /**
     * Parse text without any actions directly into a DocumentFragment (fast path).
     */
    private _parseTextOnlyToFragment;
    /**
     * Parse an action section and return the parsed action.
     */
    private _parseActionSection;
    /**
     * Parse options from an enclosed action.
     */
    private _parseOptions;
    /**
     * Execute the provided action.
     */
    executeAction(actionObj: ParsedAction): void;
    /**
     * Adjust the received speed and return it with some randomization.
     * Uses shared utility from typing-utils.
     */
    humanizer(speed: number): number;
    /**
     * Set the cursor on an element, and unset it from the previous element.
     */
    setCursor(element: Element | undefined, unset: Element | undefined): void;
    /**
     * Unset the cursor on an element.
     */
    unsetCursor(element: NodeList | Element): void;
    /**
     * Unset all cursors at once.
     */
    unsetAllCursors(ignore?: boolean): void;
    typewrite(): void;
    /**
     * Animation frame loop for smooth typing.
     */
    private _animationLoop;
    /**
     * Reveal the next character and schedule the next one.
     */
    private _revealNextCharacter;
    /**
     * Get the leaf nodes of a provided node.
     * Uses shared utility from typing-utils.
     */
    private _getLeafNodes;
    /**
     * Stop and destroy the current typing animation.
     */
    destroy(loop?: boolean): void;
    onStateUpdate(property: string, _oldValue: unknown, _newValue: unknown): Promise<void>;
    didMount(): Promise<void>;
    render(): string;
    willUnmount(): Promise<void>;
}
export default TypeWriter;
//# sourceMappingURL=index.d.ts.map