export function toInteger(value: number) {
  const num = +value;
  if (num < 0) {
    return Math.ceil(num);
  } else {
    return Math.floor(num);
  }
}
