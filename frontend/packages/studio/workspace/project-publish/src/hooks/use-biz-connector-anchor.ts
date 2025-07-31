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

import { useUserInfo } from '@coze-arch/foundation-sdk';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { useParams } from 'react-router-dom';

import { publishAnchorService } from '@/service/connector-anchor';

export const useBizConnectorAnchor = () => {
  const userId = useUserInfo()?.user_id_str;
  const projectId = useParams<DynamicParams>().project_id;

  const setAnchor = (connectorId: string) => {
    if (!userId || !projectId) {
      return;
    }
    return publishAnchorService.setAnchor({ projectId, userId, connectorId });
  };

  const getAnchor = () => {
    if (!userId || !projectId) {
      return;
    }
    return publishAnchorService.getAnchor({ userId, projectId });
  };

  const removeAnchor = () => {
    if (!userId || !projectId) {
      return;
    }
    return publishAnchorService.removeAnchor({ userId, projectId });
  };

  return {
    setAnchor,
    getAnchor,
    removeAnchor,
  };
};
