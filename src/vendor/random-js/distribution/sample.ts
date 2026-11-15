import { Engine } from "../types";
import { sliceArray } from "../utils/sliceArray";
import { shuffle } from "./shuffle";

/**
 * From the population array, produce an array with sampleSize elements that
 * are randomly chosen without repeats.
 * @param engine The Engine to use when choosing random values
 * @param population An array that has items to choose a sample from
 * @param sampleSize The size of the result array
 */
export function sample<T>(
  engine: Engine,
  population: ArrayLike<T>,
  sampleSize: number
): T[] {
  if (
    sampleSize < 0 ||
    sampleSize > population.length ||
    !isFinite(sampleSize)
  ) {
    throw new RangeError(
      "Expected sampleSize to be within 0 and the length of the population"
    );
  }

  if (sampleSize === 0) {
    return [];
  }

  const clone = sliceArray.call(population);
  const length = clone.length;
  if (length === sampleSize) {
    return shuffle(engine, clone, 0);
  }
  const tailLength = length - sampleSize;
  return shuffle(engine, clone, tailLength - 1).slice(tailLength);
}
