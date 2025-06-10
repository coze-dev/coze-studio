type PropsWithDefault<P, DP extends Partial<P>> = Omit<P, keyof DP> & DP;

export function mergeProps<P extends object, DP extends Partial<P>>(
  props: P,
  defaultProps: DP,
): PropsWithDefault<P, DP> {
  const allKeys = new Set<string>([
    ...Object.keys(defaultProps),
    ...Object.keys(props),
  ]);
  const result: Partial<P> = {};

  allKeys.forEach(key => {
    const propKey = key as keyof P;
    const defaultPropKey = key as keyof DP;

    if (props[propKey] !== undefined) {
      result[propKey] = props[propKey];
    } else {
      result[propKey] = defaultProps[defaultPropKey] as unknown as P[keyof P];
    }
  });

  return result as PropsWithDefault<P, DP>;
}
