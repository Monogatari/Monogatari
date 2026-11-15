import { UINT32_MAX } from "./constants";

/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
 */
export const imul: (a: number, b: number) => number = (() => {
  try {
    if ((Math as any).imul(UINT32_MAX, 5) === -5) {
      return (Math as any).imul;
    }
  } catch (e) {
    console.warn("Math.imul is not available or failed the test, using polyfill.", e);
  }
  const UINT16_MAX = 0xffff;
  return (a: number, b: number) => {
    const ah = (a >>> 16) & UINT16_MAX;
    const al = a & UINT16_MAX;
    const bh = (b >>> 16) & UINT16_MAX;
    const bl = b & UINT16_MAX;
    // the shift by 0 fixes the sign on the high part
    // the final |0 converts the unsigned value into a signed value
    return (al * bl + (((ah * bl + al * bh) << 16) >>> 0)) | 0;
  };
})();
