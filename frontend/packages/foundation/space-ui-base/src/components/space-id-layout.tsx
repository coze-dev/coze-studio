/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
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
