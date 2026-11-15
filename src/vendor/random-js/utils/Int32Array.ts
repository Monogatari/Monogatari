import { INT32_SIZE } from "./constants";

/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
 */
const I32Array: typeof Int32Array = (() => {
  try {
    const buffer = new ArrayBuffer(4);
    const view = new Int32Array(buffer);
    view[0] = INT32_SIZE;
    if (view[0] === -INT32_SIZE) {
      return Int32Array;
    }
  } catch (e) {
    console.warn("Int32Array check failed, falling back to Array:", e);
  }
  return (Array as unknown) as typeof Int32Array;
})();
export { I32Array as Int32Array };
