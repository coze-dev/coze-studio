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
  bindContributionProvider,
  bindContributions,
  type AsClass,
} from '@flowgram-adapter/common';

import { definePluginCreator, LifecycleContribution } from '../common';
import { LabelService } from './label-service';
import { LabelManager } from './label-manager';
import { LabelHandler } from './label-handler';

export interface LabelPluginOptions {
  handlers?: (AsClass<LabelHandler> | LabelHandler)[];
}

export const createLabelPlugin = definePluginCreator<LabelPluginOptions>({
  onBind: ({ bind }, opts) => {
    bindContributions(bind, LabelManager, [LifecycleContribution]);
    bind(LabelService).toService(LabelManager);
    bindContributionProvider(bind, LabelHandler);
    if (opts.handlers) {
      opts.handlers.forEach(handler => {
        if (typeof handler === 'function') {
          bind(handler).toSelf().inSingletonScope();
          bind(LabelHandler).toService(handler);
        } else {
          bind(LabelHandler).toConstantValue(handler);
        }
      });
    }
  },
});
