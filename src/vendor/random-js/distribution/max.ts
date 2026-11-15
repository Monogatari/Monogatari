import { Distribution } from "../types";
import { integer } from "./integer";

/**
 * Returns a Distribution to return the maximum value of random.integer
 */
export function max(minimum:number,maximum:number):Distribution<number> {
	minimum.valueOf(); // here so no unused variable warnings exist in code
	return integer(maximum,maximum);
}
