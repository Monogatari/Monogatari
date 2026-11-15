export function convertSliceArgument(value: number, length: number): number {
  if (value < 0) {
    return Math.max(value + length, 0);
  } else {
    return Math.min(value, length);
  }
}
