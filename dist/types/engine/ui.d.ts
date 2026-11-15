import type { VisualNovelEngine } from '../lib/types/Monogatari';
export declare function showAlert(engine: VisualNovelEngine, id: string, options: Record<string, unknown>): void;
export declare function dismissAlert(engine: VisualNovelEngine, id?: string | null): void;
export declare function playAmbient(engine: VisualNovelEngine): void;
export declare function stopAmbient(engine: VisualNovelEngine): void;
export declare function showMainScreen(engine: VisualNovelEngine): void;
export declare function showSplashScreen(engine: VisualNovelEngine): void;
export declare function showScreen(engine: VisualNovelEngine, screen: string): void;
/**
 * Capture the current game screen as a JPEG Blob
 */
export declare function captureGameScreenshot(engine: VisualNovelEngine): Promise<Blob | null>;
export declare function hideScreens(engine: VisualNovelEngine): void;
/**
 * @static autoPlay - Enable or disable the autoplay feature which allows the
 * game to play itself (of sorts), it will go through the dialogs alone but
 * will wait when user interaction is needed.
 *
 * @param {boolean} enable - Wether the auto play feature will be enabled (true)
 * or disabled (false);
 */
export declare function autoPlay(engine: VisualNovelEngine, enable: boolean): void;
/**
 * @static distractionFree - Enable or disable the distraction free mode
 * where the dialog box is hidden so that the player can look at the characters
 * and background with no other elements on the way. A 'transparent' class
 * is added to the quick menu when this mode is enabled.
 */
export declare function distractionFree(engine: VisualNovelEngine): void;
export declare function skip(engine: VisualNovelEngine, enable: boolean): void;
export declare function resize(engine: VisualNovelEngine, _element: unknown, proportionWidth: number, proportionHeight: number): void;
export declare function goBack(engine: VisualNovelEngine, event: Event, selector: string): void;
export declare function displayInitialScreen(engine: VisualNovelEngine): void;
//# sourceMappingURL=ui.d.ts.map