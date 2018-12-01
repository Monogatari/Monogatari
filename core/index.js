/**
 * ==============================
 * Monogatari Core Engine
 * ==============================
 */

/**
 * Import Global Vendor Libraries, these are third party libraries that must be
 * globally imported in order for Monogatari to work correctly.
 *
 * TODO: Find a way to import Font Awesome in a better way
 */
import '@babel/polyfill';
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
import './lib/translations/index.js';
import './lib/components/index.js';
import './lib/actions/index.js';

/**
 * Export Monogatari Core
 */
export * from './lib/Action.js';
export * from './lib/Component.js';
export * from './lib/FancyError.js';
export * from './lib/monogatari';