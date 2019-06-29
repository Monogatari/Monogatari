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

// Make babel use the polyfill as the package has been deprecated in favor of
// this:
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// TODO: Find a way to import Font Awesome in a better way
import './../node_modules/@fortawesome/fontawesome-free/js/all.js';

/**
 * =============================================================================
 * Exported Vendor Libraries
 * -----------------------------------------------------------------------------
 * These are third party libraries that Monogatari uses for certain functions
 * and may be helpful for the developers.
 * =============================================================================
 */

export * from '@aegis-framework/artemis';
export * from 'typed.js';

import 'particles.js';

/**
 * =============================================================================
 * Translations
 * -----------------------------------------------------------------------------
 * Import all the translations available for the UI
 * =============================================================================
 */

import './translations';

/**
 * =============================================================================
 * Components
 * -----------------------------------------------------------------------------
 * Import all the core components used by Monogatari. These components are the
 * ones that describe the behavior and appearance of all the custom elements.
 * =============================================================================
 */

import './components';

/**
 * =============================================================================
 * Actions
 * -----------------------------------------------------------------------------
 * Import all the core actions available. These actions are the ones that define
 * the allowed statements on a script and what they do.
 * =============================================================================
 */

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