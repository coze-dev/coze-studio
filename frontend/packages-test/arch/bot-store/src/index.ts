export {
  /** @deprecated 该使用方式已废弃，后续请使用@coze-arch/foundation-sdk导出的方法*/
  useSpaceStore,
  /** @deprecated 该使用方式已废弃，后续请使用@coze-arch/foundation-sdk导出的方法*/
  useSpace,
  /** @deprecated 该使用方式已废弃，后续请使用@coze-arch/foundation-sdk导出的方法*/
  useSpaceList,
} from '@coze-foundation/space-store';

export { useAuthStore } from './auth';

/** @deprecated - 持久化方案有问题，废弃 */
export { clearStorage } from './utils/get-storage';

export { useSpaceGrayStore, TccKey } from './space-gray';
