import { Distribution } from "../types";

export function add(distribution: Distribution, addend: number): Distribution {
  if (addend === 0) {
    return distribution;
  } else {
    return engine => distribution(engine) + addend;
  }
}
