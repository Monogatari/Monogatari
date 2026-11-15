import { Engine } from "../types";
import {
  SMALLEST_UNSAFE_INTEGER,
  UINT21_MAX,
  UINT21_SIZE,
  UINT32_SIZE
} from "../utils/constants";

/**
 * Returns a value within [-0x20000000000000, 0x1fffffffffffff]
 */
export function int53(engine: Engine): number {
  const high = engine.next() | 0;
  const low = engine.next() >>> 0;
  return (
    (high & UINT21_MAX) * UINT32_SIZE +
    low +
    (high & UINT21_SIZE ? -SMALLEST_UNSAFE_INTEGER : 0)
  );
}
