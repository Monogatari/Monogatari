// This file is basically just a hack to expose the Monogatari namespace in the
// window object. Once/if bun adds support for this, we can remove this file.

import * as Monogatari from './index';

declare global {
  interface Window {
    Monogatari: typeof Monogatari;
    monogatari: typeof Monogatari.default;
  }
}

if (typeof window === 'object') {
  window.Monogatari = Monogatari;
  window.monogatari = Monogatari.default;
}