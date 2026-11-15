import { Distribution } from "../types";
import { integer } from "./integer";

/**
 * Returns a Distribution that returns a random `Date` within the inclusive
 * range of [`start`, `end`].
 * @param start The minimum `Date`
 * @param end The maximum `Date`
 */
export function date(start: Date, end: Date): Distribution<Date> {
  const distribution = integer(+start, +end);
  return engine => new Date(distribution(engine));
}
