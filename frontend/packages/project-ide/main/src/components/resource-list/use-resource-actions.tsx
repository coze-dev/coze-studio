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
  type ResourceFolderProps,
  type ResourceType,
} from '@coze-project-ide/framework';
import {
  type BizResourceContextMenuBtnType,
  type ResourceFolderCozeProps,
  type BizResourceType,
} from '@coze-project-ide/biz-components';

export const useResourceActionsDemo = () => {
  const onChangeName: ResourceFolderProps['onChangeName'] =
    async changeNameEvent => {
      await console.log('[ResourceFolder]on change name>>>', changeNameEvent);
    };

  const onDelete = async (resources: ResourceType[]) => {
    await console.log('[ResourceFolder]on delete>>>', resources);
  };

  const onCreate: ResourceFolderCozeProps['onCreate'] = async (
    createEvent,
    subType,
  ) => {
    await console.log('[ResourceFolder]on create>>>', createEvent, subType);
  };

  const onCustomCreate: ResourceFolderCozeProps['onCustomCreate'] = async (
    resourceType,
    subType,
  ) => {
    await console.log(
      '[ResourceFolder]on custom create>>>',
      resourceType,
      subType,
    );
  };

  const onAction = (
    action: BizResourceContextMenuBtnType,
    resource?: BizResourceType,
  ) => {
    console.log('on action>>>', action, resource);
  };
  return {
    onChangeName,
    onAction,
    onDelete,
    onCreate,
    onCustomCreate,
  };
};
