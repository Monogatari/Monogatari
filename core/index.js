/**
 * ==============================
 * Monogatari Core Engine
 * ==============================
 */

/**
 * Import Global Vendor Libraries, these are third party libraries that must be
 * globally imported in order for Monogatari to work correctly.
 */

// Make babel use the polyfill as the package has been deprecated in favor of this:
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// TODO: Find a way to import Font Awesome in a better way
import './../node_modules/@fortawesome/fontawesome-free/js/all.js';

/**
 * Export Vendor Libraries, these are third party libraries that Monogatari uses
 * for certain functions and may be helpful for the developers.
 */
export * from '@aegis-framework/artemis';
export * from 'typed.js';

import 'particles.js';

/**
 * Import Monogatari extra files such as actions, translations and all the functionality
 * apart from the core engine.
 */
import './translations';
import './components';
import './actions';

/**
 * Export Monogatari Core
 */
export * from './lib/Action';
export * from './lib/Component';
export * from './lib/ScreenComponent';
export * from './lib/MenuComponent';
export * from './lib/FancyError';
export * from './monogatari';