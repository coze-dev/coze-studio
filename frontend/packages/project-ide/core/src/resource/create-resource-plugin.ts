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
  type AsClass,
  bindContributionProvider,
} from '@flowgram-adapter/common';

// import { LabelHandler } from '../label';
import { definePluginCreator } from '../common';
import { ResourceService } from './resource-service';
import { ResourceManager } from './resource-manager';
import { ResourceHandler } from './resource';

export interface ResourcePluginOptions {
  handlers?: (AsClass<ResourceHandler<any>> | ResourceHandler<any>)[];
}

export const createResourcePlugin = definePluginCreator<ResourcePluginOptions>({
  onBind: ({ bind }, opts) => {
    bind(ResourceManager).toSelf().inSingletonScope();
    bind(ResourceService).toSelf().inSingletonScope();
    bindContributionProvider(bind, ResourceHandler);
    if (opts.handlers) {
      opts.handlers.forEach(handler => {
        if (typeof handler === 'function') {
          bind(handler).toSelf().inSingletonScope();
          bind(ResourceHandler).toService(handler);
        } else {
          bind(ResourceHandler).toConstantValue(handler);
        }
      });
    }
  },
  onInit: ctx => {},
});
