import { useEffect } from 'react';

import { merge } from 'lodash-es';

import { type UserSenderInfo } from '../../store/types';
import { type StoreSet } from '../../context/chat-area-context/type';

export const useAutoUpdateUserInfo = ({
  userInfo,
  storeSet,
}: {
  userInfo: UserSenderInfo | null;
  storeSet: Pick<StoreSet, 'useSenderInfoStore'>;
}) => {
  useEffect(() => {
    if (!userInfo) {
      return;
    }

    const { useSenderInfoStore } = storeSet;
    const { updateUserInfo, setUserInfoMap, userInfoMap } =
      useSenderInfoStore.getState();
    updateUserInfo(userInfo);
    setUserInfoMap(
      merge([], userInfoMap, {
        [userInfo.id]: userInfo,
      }),
    );
  }, [userInfo, storeSet]);
};
