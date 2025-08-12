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

import { ResType } from '@coze-arch/bot-api/plugin_develop';

export const useNavigateResource =
  ({
    resourceId,
    resourceType,
    spaceId,
  }: {
    resourceId?: string;
    resourceType?: ResType;
    spaceId?: string;
  }) =>
  () => {
    switch (resourceType) {
      case ResType.Plugin:
        window.open(`/space/${spaceId}/plugin/${resourceId}`);
        break;
      case ResType.Workflow:
      case ResType.Imageflow:
        window.open(`/work_flow?workflow_id=${resourceId}&space_id=${spaceId}`);
        break;
      case ResType.Knowledge:
        window.open(`/space/${spaceId}/knowledge/${resourceId}`);
        break;
      case ResType.UI:
        window.open(`/space/${spaceId}/widget/${resourceId}`);
        break;
      case ResType.Database:
        window.open(
          `/space/${spaceId}/database/${resourceId}?page_mode=normal`,
        );
        break;
      default:
        return;
    }
  };
