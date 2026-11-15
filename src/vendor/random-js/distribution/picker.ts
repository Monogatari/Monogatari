import { Distribution } from "../types";
import { sliceArray } from "../utils/sliceArray";
import { integer } from "./integer";

/**
 * Returns a Distribution to random value within the provided `source`
 * within the sliced bounds of `begin` and `end`.
 * @param source an array of items to pick from
 * @param begin the beginning slice index (defaults to `0`)
 * @param end the ending slice index (defaults to `source.length`)
 */
export function picker<T>(
  source: ArrayLike<T>,
  begin?: number,
  end?: number
): Distribution<T> {
  const clone = sliceArray.call(source, begin, end);
  if (clone.length === 0) {
    throw new RangeError(`Cannot pick from a source with no items`);
  }
  const distribution = integer(0, clone.length - 1);
  return engine => clone[distribution(engine)];
}
