import { Engine } from "../types";
import {
  SMALLEST_UNSAFE_INTEGER,
  UINT21_MAX,
  UINT21_SIZE,
  UINT32_SIZE
} from "../utils/constants";

/**
 * Returns a value within [0, 0x20000000000000]
 */
export function uint53Full(engine: Engine): number {
  while (true) {
    const high = engine.next() | 0;
    if (high & UINT21_SIZE) {
      if ((high & UINT21_MAX) === 0 && (engine.next() | 0) === 0) {
        return SMALLEST_UNSAFE_INTEGER;
      }
    } else {
      const low = engine.next() >>> 0;
      return (high & UINT21_MAX) * UINT32_SIZE + low;
    }
  }
}
