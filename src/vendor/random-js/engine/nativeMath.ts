import { Engine } from "../types";
import { UINT32_SIZE } from "../utils/constants";

/**
 * An int32-producing Engine that uses `Math.random()`
 */
export const nativeMath: Engine = {
  next() {
    return (Math.random() * UINT32_SIZE) | 0;
  }
};
