/**
 * Random number between `min` and `max`, can use `crypto`, but fallbacks to `Math.random` in case it's not available
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const random = (min = 0, max = 100) => {
	try {
		// prettier-ignore
		return ((min + ((max - min + 1) * crypto.getRandomValues(new Uint32Array(1))[0]) / 2 ** 32) | 0)
	} catch (error) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};

export { random };
