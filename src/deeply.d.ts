declare module 'deeply' {
  type DeepMerge = <T extends object>(target: T, ...sources: Partial<T>[]) => T;
  const deeply: DeepMerge;
  export = deeply;
}


