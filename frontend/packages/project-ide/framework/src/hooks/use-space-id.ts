import { useIDEGlobalContext } from '../context';

export const useSpaceId = () => {
  const store = useIDEGlobalContext();
  const spaceId = store(state => state.spaceId);

  return spaceId;
};
