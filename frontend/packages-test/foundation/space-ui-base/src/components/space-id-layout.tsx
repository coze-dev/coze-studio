import { Outlet, useParams } from 'react-router-dom';

import { useDestorySpace } from '@coze-common/auth';
import { useInitSpaceRole } from '@coze-common/auth-adapter';

const SpaceIdContainer = ({ spaceId }: { spaceId: string }) => {
  // 空间组件销毁时，清空对应space数据
  useDestorySpace(spaceId);

  // 初始化空间权限数据
  const isCompleted = useInitSpaceRole(spaceId);

  // isCompleted 的 判断条件很重要，确保了在Space空间内能够获取到空间的权限数据。
  return isCompleted ? <Outlet /> : null;
};

export const SpaceIdLayout = () => {
  const { space_id: spaceId } = useParams<{
    space_id: string;
  }>();

  return spaceId ? <SpaceIdContainer key={spaceId} spaceId={spaceId} /> : null;
};
