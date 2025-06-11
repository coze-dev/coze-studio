import { usePreference } from '../../context/preference';

export const useShowBackGround = () => {
  const { showBackground } = usePreference();
  return showBackground;
};
