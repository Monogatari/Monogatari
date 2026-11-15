import { Distribution, Engine } from "../types";
import { INT32_SIZE, SMALLEST_UNSAFE_INTEGER, UINT32_SIZE } from "../utils/constants";
import { int32 } from "./int32";
import { integer } from "./integer";
import { uint53 } from "./uint53";

function isLeastBitTrue(engine: Engine) {
  return (engine.next() & 1) === 1;
}

function lessThan(
  distribution: Distribution,
  value: number
): Distribution<boolean> {
  return engine => distribution(engine) < value;
}

function probability(percentage: number) {
  if (percentage <= 0) {
    return () => false;
  } else if (percentage >= 1) {
    return () => true;
  } else {
    const scaled = percentage * UINT32_SIZE;
    if (scaled % 1 === 0) {
      return lessThan(int32, (scaled - INT32_SIZE) | 0);
    } else {
      return lessThan(uint53, Math.round(percentage * SMALLEST_UNSAFE_INTEGER));
    }
  }
}

// tslint:disable:unified-signatures

/**
 * Returns a boolean Distribution with 50% probability of being true or false
 */
export function bool(): Distribution<boolean>;
/**
 * Returns a boolean Distribution with the provided `percentage` of being true
 * @param percentage A number within [0, 1] of how often the result should be `true`
 */
export function bool(percentage: number): Distribution<boolean>;
/**
 * Returns a boolean Distribution with a probability of
 * `numerator` divided by `denominator` of being true
 * @param numerator The numerator of the probability
 * @param denominator The denominator of the probability
 */
export function bool(
  numerator: number,
  denominator: number
): Distribution<boolean>;
export function bool(
  numerator?: number,
  denominator?: number
): Distribution<boolean> {
  if (denominator == null) {
    if (numerator == null) {
      return isLeastBitTrue;
    }
    return probability(numerator);
  } else {
    if (numerator! <= 0) {
      return () => false;
    } else if (numerator! >= denominator) {
      return () => true;
    }
    return lessThan(integer(0, denominator - 1), numerator!);
  }
}
