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
  // When the space component is destroyed, empty the corresponding space data
  useDestorySpace(spaceId);

  // Initialize spatial permission data
  const isCompleted = useInitSpaceRole(spaceId);

  // isCompleted, the judgment condition is very important to ensure that the permission data of the space can be obtained in the Space space.
  return isCompleted ? <Outlet /> : null;
};

export const SpaceIdLayout = () => {
  const { space_id: spaceId } = useParams<{
    space_id: string;
  }>();

  return spaceId ? <SpaceIdContainer key={spaceId} spaceId={spaceId} /> : null;
};
