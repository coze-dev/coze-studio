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

import { type FC } from 'react';
import React from 'react';

import {
  getURIByResource,
  type ResourceFolderProps,
  ResourceTypeEnum,
  useProjectIDEServices,
} from '@coze-project-ide/framework';

import { type ResourceFolderCozeProps } from '../type';
export const withRenameSync =
  (Comp: FC<ResourceFolderCozeProps>): FC<ResourceFolderCozeProps> =>
  ({ onChangeName, ...props }) => {
    const { view } = useProjectIDEServices();
    const wrappedChangeName: ResourceFolderProps['onChangeName'] =
      async event => {
        await onChangeName?.(event);
        if (
          event.resource?.type &&
          event.resource?.id &&
          event.resource.type !== ResourceTypeEnum.Folder
        ) {
          const uri = getURIByResource(event.resource.type, event.resource.id);
          const widgetContext = view.getWidgetContextFromURI(uri);
          widgetContext?.widget?.setTitle(event.name);
        }
      };
    return <Comp {...props} onChangeName={wrappedChangeName} />;
  };
