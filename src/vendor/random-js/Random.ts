import { bool } from "./distribution/bool";
import { date } from "./distribution/date";
import { dice } from "./distribution/dice";
import { die } from "./distribution/die";
import { hex } from "./distribution/hex";
import { int32 } from "./distribution/int32";
import { int53 } from "./distribution/int53";
import { int53Full } from "./distribution/int53Full";
import { integer } from "./distribution/integer";
import { max } from "./distribution/max";
import { min } from "./distribution/min";
import { pick } from "./distribution/pick";
import { real } from "./distribution/real";
import { realZeroToOneExclusive } from "./distribution/realZeroToOneExclusive";
import { realZeroToOneInclusive } from "./distribution/realZeroToOneInclusive";
import { sample } from "./distribution/sample";
import { shuffle } from "./distribution/shuffle";
import { string } from "./distribution/string";
import { uint32 } from "./distribution/uint32";
import { uint53 } from "./distribution/uint53";
import { uint53Full } from "./distribution/uint53Full";
import { uuid4 } from "./distribution/uuid4";
import { nativeMath } from "./engine/nativeMath";
import { browserCrypto } from "./engine/browserCrypto";
import { Engine } from "./types";

// tslint:disable:unified-signatures

function detectDefaultEngine(): Engine {
  if (typeof window !== "undefined" && typeof window.crypto?.getRandomValues === "function") {
    return browserCrypto;
  }

  if (typeof process !== "undefined" && process?.versions?.node) {
    try {
      const crypto = require("crypto");
      if (crypto?.randomBytes) {
        return browserCrypto;
      }
    } catch {
      // fallback to nativeMath if crypto.randomBytes is unsupported
      return nativeMath;
    }
  }

  return nativeMath;
}

/**
 * A wrapper around an Engine that provides easy-to-use methods for
 * producing values based on known distributions
 */
export class Random {
  private readonly engine: Engine;

  /**
   * Creates a new Random wrapper
   * @param engine The engine to use (defaults to a `Math.random`-based implementation)
   */
  constructor();
  /**
   * Creates a new Random wrapper
   * @param engine The engine to use (explicitly provided)
   */
  constructor(engine: Engine);
  constructor(engine?: Engine) {
    // LEGACY: Default to nativeMath for backward compatibility
    this.engine = engine ?? nativeMath;
  }

  /**
   * Creates a new Random wrapper that automatically detects
   * and uses the best available engine for the current environment.
   * @returns A Random instance using auto-detected engine
   */
  public static auto(): Random {
    return new Random(detectDefaultEngine());
  }

  /**
   * Returns a value within [-0x80000000, 0x7fffffff]
   */
  public int32(): number {
    return int32(this.engine);
  }

  /**
   * Returns a value within [0, 0xffffffff]
   */
  public uint32(): number {
    return uint32(this.engine);
  }

  /**
   * Returns a value within [0, 0x1fffffffffffff]
   */
  public uint53(): number {
    return uint53(this.engine);
  }

  /**
   * Returns a value within [0, 0x20000000000000]
   */
  public uint53Full(): number {
    return uint53Full(this.engine);
  }

  /**
   * Returns a value within [-0x20000000000000, 0x1fffffffffffff]
   */
  public int53(): number {
    return int53(this.engine);
  }

  /**
   * Returns a value within [-0x20000000000000, 0x20000000000000]
   */
  public int53Full(): number {
    return int53Full(this.engine);
  }

  /**
   * Returns a value within [min, max]
   * @param minimum The minimum integer value, inclusive. No less than -0x20000000000000.
   * @param maximum The maximum integer value, inclusive. No greater than 0x20000000000000.
   */
  public integer(minimum: number, maximum: number): number {
    return integer(minimum, maximum)(this.engine);
  }

  /**
   * Returns the maximum of the values specified within [min, max]
   * @param minimum The minimum integer value, inclusive. No less than -0x20000000000000. Discarded.
   * @param maximum The maximum integer value, inclusive. No greater than 0x20000000000000.
   */
  public max(minimum: number, maximum: number): number {
    return max(minimum, maximum)(this.engine);
  }

  /**
   * Returns the minimum of the values specified within [min, max]
   * @param minimum The minimum integer value, inclusive. No less than -0x20000000000000.
   * @param maximum The maximum integer value, inclusive. No greater than 0x20000000000000. Discarded.
   */
  public min(minimum: number, maximum: number): number {
    return min(minimum, maximum)(this.engine);
  }

  /**
   * Returns a floating-point value within [0.0, 1.0]
   */
  public realZeroToOneInclusive(): number {
    return realZeroToOneInclusive(this.engine);
  }

  /**
   * Returns a floating-point value within [0.0, 1.0)
   */
  public realZeroToOneExclusive(): number {
    return realZeroToOneExclusive(this.engine);
  }

  /**
   * Returns a floating-point value within [min, max) or [min, max]
   * @param min The minimum floating-point value, inclusive.
   * @param max The maximum floating-point value.
   * @param inclusive If true, `max` will be inclusive.
   */
  public real(minimum: number, maximum: number, inclusive: boolean = false): number {
    return real(minimum, maximum, inclusive)(this.engine);
  }

  /**
   * Returns a boolean with 50% probability of being true or false
   */
  public bool(): boolean;
  /**
   * Returns a boolean with the provided `percentage` of being true
   * @param percentage A number within [0, 1] of how often the result should be `true`
   */
  public bool(percentage: number): boolean;
  /**
   * Returns a boolean with a probability of `numerator`/`denominator` of being true
   * @param numerator The numerator of the probability
   * @param denominator The denominator of the probability
   */
  public bool(numerator: number, denominator: number): boolean;
  public bool(numerator?: number, denominator?: number): boolean {
    return bool(numerator!, denominator!)(this.engine);
  }

  /**
   * Return a random value within the provided `source` within the sliced
   * bounds of `begin` and `end`.
   * @param source an array of items to pick from
   * @param begin the beginning slice index (defaults to `0`)
   * @param end the ending slice index (defaults to `source.length`)
   */
  public pick<T>(source: ArrayLike<T>, begin?: number, end?: number): T {
    return pick(this.engine, source, begin, end);
  }

  /**
   * Shuffles an array in-place
   * @param array The array to shuffle
   */
  public shuffle<T>(array: T[]): T[] {
    return shuffle(this.engine, array);
  }

  /**
   * From the population array, returns an array with sampleSize elements that
   * are randomly chosen without repeats.
   * @param population An array that has items to choose a sample from
   * @param sampleSize The size of the result array
   */
  public sample<T>(population: ArrayLike<T>, sampleSize: number): T[] {
    return sample(this.engine, population, sampleSize);
  }

  /**
   * Returns a value within [1, sideCount]
   * @param sideCount The number of sides of the die
   */
  public die(sideCount: number): number {
    return die(sideCount)(this.engine);
  }

  /**
   * Returns an array of length `dieCount` of values within [1, sideCount]
   * @param sideCount The number of sides of each die
   * @param dieCount The number of dice
   */
  public dice(sideCount: number, dieCount: number): number[] {
    return dice(sideCount, dieCount)(this.engine);
  }

  /**
   * Returns a Universally Unique Identifier Version 4.
   *
   * See https://en.wikipedia.org/wiki/Universally_unique_identifier
   */
  public uuid4(): string {
    return uuid4(this.engine);
  }

  /**
   * Returns a random string using numbers, uppercase and lowercase letters,
   * `_`, and `-` of length `length`.
   * @param length Length of the result string
   */
  public string(length: number): string;
  /**
   * Returns a random string using the provided string pool as the possible
   * characters to choose from of length `length`.
   * @param length Length of the result string
   */
  public string(length: number, pool: string): string;
  public string(length: number, pool?: string): string {
    return string(pool!)(this.engine, length);
  }

  /**
   * Returns a random string comprised of numbers or the characters `abcdef`
   * (or `ABCDEF`) of length `length`.
   * @param length Length of the result string
   * @param uppercase Whether the string should use `ABCDEF` instead of `abcdef`
   */
  public hex(length: number, uppercase?: boolean): string {
    return hex(uppercase)(this.engine, length);
  }

  /**
   * Returns a random `Date` within the inclusive range of [`start`, `end`].
   * @param start The minimum `Date`
   * @param end The maximum `Date`
   */
  public date(start: Date, end: Date): Date {
    return date(start, end)(this.engine);
  }
}
