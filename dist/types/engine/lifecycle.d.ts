import type { VisualNovelEngine } from '../lib/types/Monogatari';
import type { ActionInstance } from '../lib/types';
import type TypeWriterComponent from '../components/type-writer';
/**
 * @static assertAsync - This function will run any function asynchronously
 * regardless of if the function to be run is async or not.
 *
 * @param {function} callable - The function to run
 * @param {Object} [self=null] - The reference to `this` in the function
 * @param {any[]} [args=null] - The arguments with which to call the function
 *
 * @returns {Promise} - Resolves if the function returned true and rejects if
 * the function returned false.
 */
export declare function assertAsync(engine: VisualNovelEngine, callable: (...args: unknown[]) => unknown, self?: unknown, args?: unknown[] | null): Promise<void>;
/**
 * @static next - Advance to the next statement on the script
 *
 * @returns {void}
 */
export declare function next(engine: VisualNovelEngine): Promise<void>;
/**
 * @static revert - Revert to the previous statement on the script
 *
 * @returns {void}
 */
export declare function previous(engine: VisualNovelEngine): Promise<void>;
export declare function prepareAction(engine: VisualNovelEngine, statement: string, { cycle, extras }: {
    cycle: 'Application' | 'Revert';
    extras?: Record<string, unknown>;
}): ActionInstance | null;
export declare function prepareAction(engine: VisualNovelEngine, statement: Record<string, unknown>, { cycle, extras }: {
    cycle: 'Application' | 'Revert';
    extras?: Record<string, unknown>;
}): ActionInstance | null;
export declare function prepareAction(engine: VisualNovelEngine, statement: string | Record<string, unknown>, { cycle, extras }: {
    cycle: 'Application' | 'Revert';
    extras?: Record<string, unknown>;
}): ActionInstance | null;
/**
 * @static revert - This is the function that allows to go back in the game
 * by reverting the statements played.
 *
 * @returns {Promise} - Whether the game was able to go back or not
 */
export declare function revert(engine: VisualNovelEngine, statement?: unknown, shouldAdvance?: boolean, shouldStepBack?: boolean): Promise<{
    advance: boolean;
    step: boolean;
} | void>;
/**
 * @static run - Run a specified statement.
 *
 * @param {string|Object|function} statement - The Monogatari statement to run
 * @param {boolean} advance - Whether the game should advance or wait for user
 * interaction. This parameter is mainly used to prevent the game from advancing
 * when loading the game or performing some actions and we don't want them to
 * affect the game flow.
 *
 * @returns {Promise} - Resolves if the statement was run correctly or rejects
 * if it couldn't be run correctly.
 */
export declare function run(engine: VisualNovelEngine, statement: unknown, shouldAdvance?: boolean): Promise<{
    advance: boolean;
}>;
export declare function proceed(engine: VisualNovelEngine, { userInitiated, skip, autoPlay }?: {
    userInitiated?: boolean | undefined;
    skip?: boolean | undefined;
    autoPlay?: boolean | undefined;
}): Promise<void>;
export declare function rollback(engine: VisualNovelEngine): Promise<void>;
/**
 * @static shouldProceed - Check if the game can proceed
 *
 * @returns {Promise} - Resolves if the game can proceed or reject if it
 * can't proceed right now.
 */
export declare function shouldProceed(engine: VisualNovelEngine, { userInitiated, skip, autoPlay }: {
    userInitiated?: boolean | undefined;
    skip?: boolean | undefined;
    autoPlay?: boolean | undefined;
}): Promise<unknown[]>;
export declare function willProceed(engine: VisualNovelEngine): Promise<unknown[]>;
/**
 * @static stopTyping - Stop the typing effect.
 *
 * @param component - A TypeWriter component instance
 * @returns {void}
 */
export declare function stopTyping(engine: VisualNovelEngine, component: TypeWriterComponent): void;
/**
 * @static shouldRollback - Check if the game can revert
 *
 * @returns {Promise} - Resolves if the game can be reverted or reject if it
 * can't be reverted right now.
 */
export declare function shouldRollback(engine: VisualNovelEngine): Promise<unknown[]>;
export declare function willRollback(engine: VisualNovelEngine): Promise<unknown[]>;
//# sourceMappingURL=lifecycle.d.ts.map