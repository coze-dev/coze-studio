import { useEffect, useState } from 'react';

import { useMemoizedFn } from 'ahooks';

export const useAnimationChange = ({ isVisible }: { isVisible?: boolean }) => {
  const [isShowAni, setIsShowAni] = useState(false);
  useEffect(() => {
    if (!isVisible) {
      setIsShowAni(false);
    }
  }, [isVisible]);
  const changeAnimationStatus = useMemoizedFn((isCurFavorite: boolean) => {
    if (!isCurFavorite) {
      setIsShowAni(true);
    } else {
      setIsShowAni(false);
    }
  });
  return { isShowAni, changeAnimationStatus };
};
