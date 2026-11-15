import { Engine } from "../types";
import { imul } from "../utils/imul";
import { createEntropy } from "../utils/createEntropy";
import { Int32Array } from "../utils/Int32Array";

// Constants for xorgen4096
const ARRAY_SIZE = 4096;
const ARRAY_MASK = ARRAY_SIZE - 1;

/**
 * An Engine that is a pseudorandom number generator using
 * xorgen4096 algorithm with 4096-length state array.
 */
export class XorGen4096 implements Engine {
  private readonly data = new Int32Array(ARRAY_SIZE);
  private index = 0;
  private uses = 0;

  /**
   * Returns a XorGen4096 seeded with an initial int32 value
   */
  public static seed(initial: number): XorGen4096 {
    return new XorGen4096().seed(initial);
  }

  /**
   * Returns a XorGen4096 seeded with zero or more int32 values
   */
  public static seedWithArray(source: ArrayLike<number>): XorGen4096 {
    return new XorGen4096().seedWithArray(source);
  }

  /**
   * Returns a XorGen4096 seeded with the current time and
   * a series of natively-generated random values
   */
  public static autoSeed(): XorGen4096 {
    return XorGen4096.seedWithArray(createEntropy());
  }

  private constructor() {}

  /**
   * Returns the next int32 value of the sequence
   */
  public next(): number {
    // Advance index in a circular manner
    const i = this.index;
    this.index = (this.index + 1) & ARRAY_MASK;

    let t = this.data[i];
    const s = this.data[(i + 1) & ARRAY_MASK];

    t ^= (t << 13);
    t ^= (t >>> 17);
    t ^= (s ^ (s >>> 5));

    this.data[i] = t;

    this.uses++;
    return t | 0;
  }

  /**
   * Returns the number of times that the Engine has been used.
   */
  public getUseCount(): number {
    return this.uses;
  }

  /**
   * Discards one or more items from the engine
   */
  public discard(count: number): this {
    if (count <= 0) return this;
    this.uses += count;
    this.index = (this.index + count) & ARRAY_MASK;
    return this;
  }

  private seed(initial: number): this {
    let prev = initial | 0;
    this.data[0] = prev;

    for (let i = 1; i < ARRAY_SIZE; i++) {
      prev = imul(prev ^ (prev >>> 30), 0x6c078965) + i | 0;
      this.data[i] = prev;
    }

    this.index = 0;
    this.uses = 0;
    return this;
  }

  private seedWithArray(source: ArrayLike<number>): this {
    this.seed(19650218);
    let i = 1;
	let j = 0;
    const length = source.length;

    let k = ARRAY_SIZE > length ? ARRAY_SIZE : length;

    for (; k > 0; k--) {
      this.data[i] = (this.data[i] ^ imul(this.data[i - 1] ^ (this.data[i - 1] >>> 30), 1664525)) + source[j] + j | 0;
      i++;
      j++;
      if (i >= ARRAY_SIZE) {
        this.data[0] = this.data[ARRAY_SIZE - 1];
        i = 1;
      }
      if (j >= length) j = 0;
    }

    for (k = ARRAY_SIZE - 1; k > 0; k--) {
      this.data[i] = (this.data[i] ^ imul(this.data[i - 1] ^ (this.data[i - 1] >>> 30), 1566083941)) - i | 0;
      i++;
      if (i >= ARRAY_SIZE) {
        this.data[0] = this.data[ARRAY_SIZE - 1];
        i = 1;
      }
    }

    this.index = 0;
    this.uses = 0;
    return this;
  }
}
