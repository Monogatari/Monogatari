import { StringDistribution } from "../types";
import { string } from "./string";

const LOWER_HEX_POOL = "0123456789abcdef";
const lowerHex = string(LOWER_HEX_POOL);
const upperHex = string(LOWER_HEX_POOL.toUpperCase());

/**
 * Returns a Distribution that returns a random string comprised of numbers
 * or the characters `abcdef` (or `ABCDEF`) of length `length`.
 * @param length Length of the result string
 * @param uppercase Whether the string should use `ABCDEF` instead of `abcdef`
 */
export function hex(uppercase?: boolean): StringDistribution {
  if (uppercase) {
    return upperHex;
  } else {
    return lowerHex;
  }
}
