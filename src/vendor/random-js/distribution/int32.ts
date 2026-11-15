import { Engine } from "../types";

/**
 * Returns a value within [-0x80000000, 0x7fffffff]
 */
export function int32(engine: Engine): number {
  return engine.next() | 0;
}
