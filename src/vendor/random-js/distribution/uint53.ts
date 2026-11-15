import { Engine } from "../types";
import { UINT21_MAX, UINT32_SIZE } from "../utils/constants";

/**
 * Returns a value within [0, 0x1fffffffffffff]
 */
export function uint53(engine: Engine): number {
  const high = engine.next() & UINT21_MAX;
  const low = engine.next() >>> 0;
  return high * UINT32_SIZE + low;
}
