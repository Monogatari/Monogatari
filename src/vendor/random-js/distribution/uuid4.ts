import { Engine } from "../types";
import { stringRepeat } from "../utils/stringRepeat";

function zeroPad(text: string, zeroCount: number) {
  return stringRepeat("0", zeroCount - text.length) + text;
}

/**
 * Returns a Universally Unique Identifier Version 4.
 *
 * See http://en.wikipedia.org/wiki/Universally_unique_identifier
 */
export function uuid4(engine: Engine) {
  const a = engine.next() >>> 0;
  const b = engine.next() | 0;
  const c = engine.next() | 0;
  const d = engine.next() >>> 0;

  return (
    zeroPad(a.toString(16), 8) +
    "-" +
    zeroPad((b & 0xffff).toString(16), 4) +
    "-" +
    zeroPad((((b >> 4) & 0x0fff) | 0x4000).toString(16), 4) +
    "-" +
    zeroPad(((c & 0x3fff) | 0x8000).toString(16), 4) +
    "-" +
    zeroPad(((c >> 4) & 0xffff).toString(16), 4) +
    zeroPad(d.toString(16), 8)
  );
}
