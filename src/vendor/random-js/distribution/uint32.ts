import { Engine } from "../types";

/**
 * Returns a value within [0, 0xffffffff]
 */
export function uint32(engine: Engine): number {
  return engine.next() >>> 0;
}
