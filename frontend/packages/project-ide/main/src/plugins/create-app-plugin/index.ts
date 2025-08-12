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

/**
 * Plugin to host the business logic of the project ide app
 */
import { type NavigateFunction } from 'react-router-dom';

import {
  bindContributions,
  definePluginCreator,
  LifecycleContribution,
  LayoutRestorer,
  type PluginCreator,
  OptionsService,
} from '@coze-project-ide/framework';

import { WidgetEventService } from './widget-event-service';
import { ProjectInfoService } from './project-info-service';
import { OpenURIResourceService } from './open-url-resource-service';
import { LayoutRestoreService } from './layout-restore-service';
import { AppContribution } from './app-contribution';

interface createAppPluginOptions {
  spaceId: string;
  projectId: string;
  version: string;
  navigate: NavigateFunction;
}

export const createAppPlugin: PluginCreator<createAppPluginOptions> =
  definePluginCreator({
    onBind({ bind, rebind }, options) {
      bind(OptionsService).toConstantValue(options);
      bind(ProjectInfoService).toSelf().inSingletonScope();

      bind(OpenURIResourceService).toSelf().inSingletonScope();
      bind(WidgetEventService).toSelf().inSingletonScope();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      rebind(LayoutRestorer).to(LayoutRestoreService).inSingletonScope();

      bindContributions(bind, AppContribution, [LifecycleContribution]);
    },
  });
