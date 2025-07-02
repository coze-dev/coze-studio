import { useGlobalState } from './use-global-state';

export const useSpaceId = (): string => {
  const globalState = useGlobalState();
  return globalState.spaceId;
};
