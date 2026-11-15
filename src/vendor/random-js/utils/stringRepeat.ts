export const stringRepeat = (() => {
  try {
    if (("x" as any).repeat(3) === "xxx") {
      return (pattern: string, count: number): string =>
        (pattern as any).repeat(count);
    }
  } catch (e) {
    console.warn("String.prototype.repeat check failed, using fallback:", e);
  }
  return (pattern: string, count: number): string => {
    let result = "";
    while (count > 0) {
      if (count & 1) {
        result += pattern;
      }
      count >>= 1;
      pattern += pattern;
    }
    return result;
  };
})();
