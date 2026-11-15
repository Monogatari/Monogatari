import { Engine } from "../types";
import { Int32Array } from "../utils/Int32Array";

let data: Int32Array | null = null;
const COUNT = 128;
let index = COUNT;

/**
 * An Engine that relies on the globally-available `crypto.getRandomValues`,
 * which is typically available in modern browsers.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
 *
 * If unavailable or otherwise non-functioning, then `browserCrypto` will
 * likely `throw` on the first call to `next()`.
 */
export const browserCrypto: Engine = {
  next() {
    if (index >= COUNT) {
      data ??= new Int32Array(COUNT);
      crypto.getRandomValues(data);
      index = 0;
    }
    return data![index++] | 0;
  }
};
