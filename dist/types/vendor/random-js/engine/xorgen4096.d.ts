import { Engine } from "../types";
/**
 * An Engine that is a pseudorandom number generator using
 * xorgen4096 algorithm with 4096-length state array.
 */
export declare class XorGen4096 implements Engine {
    private readonly data;
    private index;
    private uses;
    /**
     * Returns a XorGen4096 seeded with an initial int32 value
     */
    static seed(initial: number): XorGen4096;
    /**
     * Returns a XorGen4096 seeded with zero or more int32 values
     */
    static seedWithArray(source: ArrayLike<number>): XorGen4096;
    /**
     * Returns a XorGen4096 seeded with the current time and
     * a series of natively-generated random values
     */
    static autoSeed(): XorGen4096;
    private constructor();
    /**
     * Returns the next int32 value of the sequence
     */
    next(): number;
    /**
     * Returns the number of times that the Engine has been used.
     */
    getUseCount(): number;
    /**
     * Discards one or more items from the engine
     */
    discard(count: number): this;
    private seed;
    private seedWithArray;
}
//# sourceMappingURL=xorgen4096.d.ts.map