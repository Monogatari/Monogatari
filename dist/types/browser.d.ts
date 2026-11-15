import * as Monogatari from './index';
declare global {
    interface Window {
        Monogatari: typeof Monogatari;
        monogatari: typeof Monogatari.default;
    }
}
//# sourceMappingURL=browser.d.ts.map