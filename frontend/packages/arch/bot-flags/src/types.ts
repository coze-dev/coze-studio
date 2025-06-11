import { type FEATURE_FLAGS as ORIGIN_FEATURE_FLAGS } from './feature-flags';

// eslint-disable-next-line @typescript-eslint/naming-convention
type FEATURE_FLAGS = ORIGIN_FEATURE_FLAGS & {
  /**
   * 返回所有可用 key 列表
   */
  keys: string[];
  /**
   * FG 是否已经完成初始化
   */
  isInited: boolean;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __fetch_fg_promise__: Promise<{ data: FEATURE_FLAGS }>;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __fg_values__: FEATURE_FLAGS;
  }
}

export { type FEATURE_FLAGS };

export type FetchFeatureGatingFunction = () => Promise<FEATURE_FLAGS>;
