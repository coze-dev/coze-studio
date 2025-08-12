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

import {
  type BizResourceType,
  useResourceCopyDispatch,
} from '@coze-project-ide/biz-components';
import { resource_resource_common } from '@coze-arch/bot-api/plugin_develop';

export interface ResourceOperationProps {
  projectId: string;
}

export const useResourceOperation = ({ projectId }: ResourceOperationProps) => {
  const copyDispatch = useResourceCopyDispatch();
  return async ({
    scene,
    resource,
  }: {
    scene: resource_resource_common.ResourceCopyScene;
    resource?: BizResourceType;
  }) => {
    try {
      console.log(
        `[ResourceFolder]workflow resource copy dispatch, scene ${scene}>>>`,
        resource,
      );
      await copyDispatch({
        scene,
        res_id: resource?.id,
        res_type: resource_resource_common.ResType.Plugin,
        project_id: projectId,
        res_name: resource?.name || '',
      });
    } catch (e) {
      console.error(
        `[ResourceFolder]workflow resource copy dispatch, scene ${scene} error>>>`,
        e,
      );
    }
  };
};
