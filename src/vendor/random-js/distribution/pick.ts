import { Engine } from "../types";
import { convertSliceArgument } from "../utils/convertSliceArgument";
import { toInteger } from "../utils/toInteger";
import { integer } from "./integer";

/**
 * Returns a random value within the provided `source` within the sliced
 * bounds of `begin` and `end`.
 * @param source an array of items to pick from
 * @param begin the beginning slice index (defaults to `0`)
 * @param end the ending slice index (defaults to `source.length`)
 */
export function pick<T>(
  engine: Engine,
  source: ArrayLike<T>,
  begin?: number,
  end?: number
): T {
  const length = source.length;
  if (length === 0) {
    throw new RangeError("Cannot pick from an empty array");
  }
  const start =
    begin == null ? 0 : convertSliceArgument(toInteger(begin), length);
  const finish =
    end === void 0 ? length : convertSliceArgument(toInteger(end), length);
  if (start >= finish) {
    throw new RangeError(`Cannot pick between bounds ${start} and ${finish}`);
  }
  const distribution = integer(start, finish - 1);
  return source[distribution(engine)];
}
