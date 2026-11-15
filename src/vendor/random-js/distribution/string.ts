import { StringDistribution } from "../types";
import { integer } from "./integer";

// tslint:disable:unified-signatures

// has 2**x chars, for faster uniform distribution
const DEFAULT_STRING_POOL =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";

/**
 * Returns a distribution that returns a random string using numbers,
 * uppercase and lowercase letters, `_`, and `-` of length `length`.
 * @param length Length of the result string
 */
export function string(): StringDistribution;
/**
 * Returns a distribution that returns a random string using the provided
 * string pool as the possible characters to choose from of length `length`.
 * @param length Length of the result string
 */
export function string(pool: string): StringDistribution;
export function string(pool: string = DEFAULT_STRING_POOL): StringDistribution {
  const poolLength = pool.length;
  if (!poolLength) {
    throw new Error("Expected pool not to be an empty string");
  }

  const distribution = integer(0, poolLength - 1);
  return (engine, length) => {
    let result = "";
    for (let i = 0; i < length; ++i) {
      const j = distribution(engine);
      result += pool.charAt(j);
    }
    return result;
  };
}
