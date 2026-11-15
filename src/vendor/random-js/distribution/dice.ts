import { Distribution } from "../types";
import { die } from "./die";

/**
 * Returns a distribution that returns an array of length `dieCount` of values
 * within [1, `sideCount`]
 * @param sideCount The number of sides of each die
 * @param dieCount The number of dice
 */
export function dice(
  sideCount: number,
  dieCount: number
): Distribution<number[]> {
  const distribution = die(sideCount);
  return engine => {
    const result = [];
    for (let i = 0; i < dieCount; ++i) {
      result.push(distribution(engine));
    }
    return result;
  };
}
