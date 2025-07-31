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

import { bindContributions } from '@flowgram-adapter/common';

import { ShortcutsContribution } from '../shortcut/shortcuts-service';
import { definePluginCreator, LifecycleContribution } from '../common';
import { CommandContribution } from '../command';
import { NavigationService } from './navigation-service';
import { NavigationHistory } from './navigation-history';
import { NavigationContribution } from './navigation-contribution';

export interface NavigationPluginOptions {
  uriScheme?: string;
}

export const createNavigationPlugin =
  definePluginCreator<NavigationPluginOptions>({
    onBind: ({ bind }) => {
      bind(NavigationHistory).toSelf().inSingletonScope();
      bind(NavigationService).toSelf().inSingletonScope();
      bindContributions(bind, NavigationContribution, [
        LifecycleContribution,
        CommandContribution,
        ShortcutsContribution,
      ]);
    },
    onInit(ctx, opts) {
      if (opts.uriScheme) {
        ctx.container.get(NavigationService).setScheme(opts.uriScheme);
      }
    },
  });
