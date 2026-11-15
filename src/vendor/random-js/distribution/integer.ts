import { Distribution, Engine } from "../types";
import { add } from "../utils/add";
import {
  INT32_SIZE,
  LARGEST_SAFE_INTEGER,
  SMALLEST_UNSAFE_INTEGER,
  UINT21_MAX,
  UINT21_SIZE,
  UINT32_MAX,
  UINT32_SIZE
} from "../utils/constants";
import { int32 } from "./int32";
import { int53 } from "./int53";
import { int53Full } from "./int53Full";
import { uint32 } from "./uint32";
import { uint53 } from "./uint53";
import { uint53Full } from "./uint53Full";

function isPowerOfTwoMinusOne(value: number): boolean {
  return ((value + 1) & value) === 0;
}

function bitmask(masking: number): Distribution {
  return (engine: Engine) => engine.next() & masking;
}

function downscaleToLoopCheckedRange(range: number): Distribution {
  const extendedRange = range + 1;
  const maximum = extendedRange * Math.floor(UINT32_SIZE / extendedRange);
  return engine => {
    let value = 0;
    do {
      value = engine.next() >>> 0;
    } while (value >= maximum);
    return value % extendedRange;
  };
}

function downscaleToRange(range: number): Distribution {
  if (isPowerOfTwoMinusOne(range)) {
    return bitmask(range);
  } else {
    return downscaleToLoopCheckedRange(range);
  }
}

function isEvenlyDivisibleByMaxInt32(value: number): boolean {
  return (value | 0) === 0;
}

function upscaleWithHighMasking(masking: number): Distribution {
  return engine => {
    const high = engine.next() & masking;
    const low = engine.next() >>> 0;
    return high * UINT32_SIZE + low;
  };
}

function upscaleToLoopCheckedRange(extendedRange: number): Distribution {
  const maximum =
    extendedRange * Math.floor(SMALLEST_UNSAFE_INTEGER / extendedRange);
  return engine => {
    let ret = 0;
    do {
      const high = engine.next() & UINT21_MAX;
      const low = engine.next() >>> 0;
      ret = high * UINT32_SIZE + low;
    } while (ret >= maximum);
    return ret % extendedRange;
  };
}

function upscaleWithinU53(range: number): Distribution {
  const extendedRange = range + 1;
  if (isEvenlyDivisibleByMaxInt32(extendedRange)) {
    const highRange = ((extendedRange / UINT32_SIZE) | 0) - 1;
    if (isPowerOfTwoMinusOne(highRange)) {
      return upscaleWithHighMasking(highRange);
    }
  }
  return upscaleToLoopCheckedRange(extendedRange);
}

function upscaleWithinI53AndLoopCheck(min: number, max: number): Distribution {
  return engine => {
    let ret = 0;
    do {
      const high = engine.next() | 0;
      const low = engine.next() >>> 0;
      ret =
        (high & UINT21_MAX) * UINT32_SIZE +
        low +
        (high & UINT21_SIZE ? -SMALLEST_UNSAFE_INTEGER : 0);
    } while (ret < min || ret > max);
    return ret;
  };
}

/**
 * Returns a Distribution to return a value within [min, max]
 * @param min The minimum integer value, inclusive. No less than -0x20000000000000.
 * @param max The maximum integer value, inclusive. No greater than 0x20000000000000.
 */
export function integer(min: number, max: number): Distribution {
  min = Math.floor(min);
  max = Math.floor(max);
  if (min < -SMALLEST_UNSAFE_INTEGER || !isFinite(min)) {
    throw new RangeError(
      `Expected min to be at least ${-SMALLEST_UNSAFE_INTEGER}`
    );
  } else if (max > SMALLEST_UNSAFE_INTEGER || !isFinite(max)) {
    throw new RangeError(
      `Expected max to be at most ${SMALLEST_UNSAFE_INTEGER}`
    );
  }

  const range = max - min;
  if (range <= 0 || !isFinite(range)) {
    return () => min;
  } else if (range === UINT32_MAX) {
    if (min === 0) {
      return uint32;
    } else {
      return add(int32, min + INT32_SIZE);
    }
  } else if (range < UINT32_MAX) {
    return add(downscaleToRange(range), min);
  } else if (range === LARGEST_SAFE_INTEGER) {
    return add(uint53, min);
  } else if (range < LARGEST_SAFE_INTEGER) {
    return add(upscaleWithinU53(range), min);
  } else if (max - 1 - min === LARGEST_SAFE_INTEGER) {
    return add(uint53Full, min);
  } else if (
    min === -SMALLEST_UNSAFE_INTEGER &&
    max === SMALLEST_UNSAFE_INTEGER
  ) {
    return int53Full;
  } else if (min === -SMALLEST_UNSAFE_INTEGER && max === LARGEST_SAFE_INTEGER) {
    return int53;
  } else if (min === -LARGEST_SAFE_INTEGER && max === SMALLEST_UNSAFE_INTEGER) {
    return add(int53, 1);
  } else if (max === SMALLEST_UNSAFE_INTEGER) {
    return add(upscaleWithinI53AndLoopCheck(min - 1, max - 1), 1);
  } else {
    return upscaleWithinI53AndLoopCheck(min, max);
  }
}
