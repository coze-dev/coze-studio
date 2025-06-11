// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proxyCache = new WeakMap<object, any>();

const proxyIdentifier = Symbol('proxy-freeze-identifier');

/** 拦截直接对对象（含数组）的修改；没处理 class */
export function proxyFreeze<T extends object>(target: T, path = 'obj') {
  if (
    !IS_DEV_MODE ||
    target === undefined ||
    target === null ||
    typeof target !== 'object'
  ) {
    return target;
  }

  if (proxyCache.has(target)) {
    return proxyCache.get(target) as T;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (target && target[proxyIdentifier]) {
    return target;
  }

  for (const key of Object.keys(target)) {
    if (!Object.getOwnPropertyDescriptor(target, key)?.writable) {
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    target[key] = proxyFreeze(target[key], `${path}.${key}`);
  }

  const proxyTarget = new Proxy(target, {
    set: (_, prop) => {
      console.error(`!!!已冻结，请勿直接修改 ${path}.${String(prop)}`);
      return false;
    },

    get: (curTarget, key) => {
      if (key === proxyIdentifier) {
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return curTarget[key];
    },
  });

  proxyCache.set(target, proxyTarget);
  return proxyTarget;
}
