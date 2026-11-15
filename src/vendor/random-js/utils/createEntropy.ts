import { nativeMath } from "../engine/nativeMath";
import { Engine } from "../types";

/**
 * Returns an array of random int32 values, based on current time
 * and a random number engine
 *
 * @param engine an Engine to pull random values from, default `nativeMath`
 * @param length the length of the Array, minimum 1, default 16
 */
export function createEntropy(
  engine: Engine = nativeMath,
  length: number = 16
): number[] {
  const array: number[] = [];
  array.push(new Date().getTime() | 0);
  for (let i = 1; i < length; ++i) {
    array[i] = engine.next() | 0;
  }
  return array;
}
