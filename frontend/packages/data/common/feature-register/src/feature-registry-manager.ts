/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExternalStore } from './external-store';
import type { FeatureRegistry } from '.';

class FeatureRegistryManager extends ExternalStore<
  Set<FeatureRegistry<any, any, any>>
> {
  protected _state = new Set<FeatureRegistry<any, any, any>>();

  add(featureRegistry: FeatureRegistry<any, any, any>) {
    this._produce(draft => {
      draft.add(featureRegistry);
    });
  }

  delete(featureRegistry: FeatureRegistry<any, any, any>) {
    this._produce(draft => {
      draft.delete(featureRegistry);
    });
  }
}

/**
 * FeatureRegistryManager 的实例，用于注册和注销 FeatureRegistry。开发过程中 FeatureRegistry 初始化的时候会写入到这个实例中，方便调试。
 */
export const featureRegistryManager = new FeatureRegistryManager();
