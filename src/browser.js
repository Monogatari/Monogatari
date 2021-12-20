/**
 * This is a small hack required to replicate the "global" availability of
 * Monogatari as a library in the window object. Parcel v1 previously had an
 * option for this that has been removed in v2 so this is just a way around it.
 * Once an alternative is provided by parcel, this should be removed.
 */

import * as Monogatari from './index.js';

if (typeof window !== 'undefined') {
	window.Monogatari = Monogatari;
}