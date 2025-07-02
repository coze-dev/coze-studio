import { useIDEGlobalStore } from '@coze-project-ide/base-interface';

export const useCommitVersion = () => {
  // 内置了 shallow 操作，无需 useShallow
  // eslint-disable-next-line @coze-arch/zustand/prefer-shallow
  const { version, patch } = useIDEGlobalStore(store => ({
    version: store.version,
    patch: store.patch,
  }));

  return {
    version,
    patch,
  };
};
