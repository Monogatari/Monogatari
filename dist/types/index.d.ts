/**
 * =============================================================================
 * Monogatari Core Engine
 * =============================================================================
 */
/**
 * =============================================================================
 * Global Vendor Libraries
 * -----------------------------------------------------------------------------
 * These are third party libraries that must be globally imported in order for
 * Monogatari to work correctly.
 * =============================================================================
 */
import '@fortawesome/fontawesome-free/js/all';
/**
 * =============================================================================
 * Exported Vendor Libraries
 * -----------------------------------------------------------------------------
 * These are third party libraries that Monogatari uses for certain functions
 * and may be helpful for the developers.
 * =============================================================================
 */
export * from '@aegis-framework/artemis';
export { tsParticles } from '@tsparticles/engine';
export * from '@tsparticles/slim';
export * as RandomJS from './vendor/random-js';
export * as Luxon from 'luxon';
import Monogatari from './monogatari';
/**
 * Export Monogatari Core
 */
export { default as Action } from './lib/Action';
export { default as Component } from './lib/Component';
export { default as ShadowComponent } from './lib/ShadowComponent';
export * from './lib/ScreenComponent';
export * from './lib/MenuComponent';
export * from './lib/FancyError';
import AudioPlayer from './lib/AudioPlayer';
export { AudioPlayer };
export default Monogatari;
//# sourceMappingURL=index.d.ts.map