import { Engine } from "../types";
import { integer } from "./integer";

/**
 * Shuffles an array in-place
 * @param engine The Engine to use when choosing random values
 * @param array The array to shuffle
 * @param downTo minimum index to shuffle. Only used internally.
 */
export function shuffle<T>(
  engine: Engine,
  array: T[],
  downTo: number = 0
): T[] {
  const length = array.length;
  if (length) {
    for (let i = (length - 1) >>> 0; i > downTo; --i) {
      const distribution = integer(0, i);
      const j = distribution(engine);
      if (i !== j) {
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
      }
    }
  }
  return array;
}
