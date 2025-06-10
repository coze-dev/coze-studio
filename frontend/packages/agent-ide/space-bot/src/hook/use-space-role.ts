import { useState } from 'react';

import { useRequest } from 'ahooks';
import { SpaceApiV2 } from '@coze-arch/bot-space-api';
import { SpaceRoleType } from '@coze-arch/bot-api/playground_api';

export const useSpaceRole = () => {
  const [isOwner, setIsOwner] = useState(false);
  useRequest(
    () =>
      SpaceApiV2.SpaceMemberDetailV2({
        page: 1,
        size: 1,
      }),
    {
      onSuccess: res => {
        setIsOwner(res.data?.space_role_type === SpaceRoleType.Owner);
      },
    },
  );
  return {
    isOwner,
  };
};
