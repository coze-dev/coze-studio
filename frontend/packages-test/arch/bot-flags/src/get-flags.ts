import { featureFlagStorage } from './utils/storage';

export const getFlags = () => {
  const flags = featureFlagStorage.getFlags();
  return flags;
};
