import { Distribution } from "../types";
import { integer } from "./integer";

/**
 * Returns a Distribution to return the minimum value of random.integer
 */
export function min(minimum:number,maximum:number):Distribution<number> {
	maximum.valueOf(); // here so no unused variable warnings exist in code
	return integer(minimum,minimum);
}
