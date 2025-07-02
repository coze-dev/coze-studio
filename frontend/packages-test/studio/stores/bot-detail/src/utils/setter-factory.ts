import { type create } from 'zustand';

export interface SetterAction<T> {
  /**
   * 增量更新
   *
   * @example
   * // store.x: { a: 1, b: 2 }
   * setX({a: 2});
   * // store.x: { a: 2, b: 2 }
   */
  (state: Partial<T>): void;
  /**
   * 全量更新
   *
   * @example
   * // store.x: { a: 1, b: 2 }
   * setX({a: 2}, { replace: true });
   * // store.x: { a: 2 }
   */
  (state: T, config: { replace: true }): void;
}

export function setterActionFactory<T>(
  set: Parameters<Parameters<typeof create<T, []>>[0]>[0],
): SetterAction<T> {
  return (state: Partial<T>, config?: { replace: true }) => {
    if (config?.replace) {
      set(state);
    } else {
      set(prevState => ({ ...prevState, ...state }));
    }
  };
}
