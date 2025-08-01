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
  bindConfigEntity,
  definePluginCreator,
  type PluginCreator,
} from '@flowgram-adapter/fixed-layout-editor';

import {
  CustomLinesManager,
  CustomHoverService,
  TreeService,
} from '../services';
import { CustomRenderStateConfigEntity } from '../entities';

export const createCustomLinesPlugin: PluginCreator<any> =
  definePluginCreator<any>({
    onBind: ({ bind }) => {
      bind(CustomLinesManager).toSelf().inSingletonScope();
      bind(CustomHoverService).toSelf().inSingletonScope();
      bind(TreeService).toSelf().inSingletonScope();
      bindConfigEntity(bind, CustomRenderStateConfigEntity);
    },
  });
