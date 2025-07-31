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
  LabelHandler,
  LifecycleContribution,
  WindowService,
  bindContributions,
} from '@coze-project-ide/client';
import {
  ViewContribution,
  definePluginCreator,
  type PluginCreator,
} from '@coze-project-ide/client';

import {
  ModalService,
  ErrorService,
  MessageEventService,
  WsService,
} from '@/services';

import { ProjectIDEClientProps } from '../../types';
import { ViewService } from './view-service';
import { TooltipContribution } from './tooltip-contribution';
import { ProjectIDEServices } from './project-ide-services';
import { PresetContribution } from './preset-contribution';
import { LifecycleService } from './lifecycle-service';

export const createPresetPlugin: PluginCreator<ProjectIDEClientProps> =
  definePluginCreator({
    onBind: ({ bind }, opts) => {
      bind(ProjectIDEClientProps).toConstantValue(opts);
      bind(LifecycleService).toSelf().inSingletonScope();
      bind(ViewService).toSelf().inSingletonScope();
      bind(ModalService).toSelf().inSingletonScope();
      bind(MessageEventService).toSelf().inSingletonScope();
      bind(ErrorService).toSelf().inSingletonScope();
      bind(WsService).toSelf().inSingletonScope();
      bind(ProjectIDEServices).toSelf().inSingletonScope();
      bindContributions(bind, PresetContribution, [
        ViewContribution,
        LifecycleContribution,
      ]);
      bindContributions(bind, TooltipContribution, [LabelHandler]);
    },
    onStart: ctx => {
      const windowService = ctx.container.get<WindowService>(WindowService);
      windowService.onStart();
    },
    onDispose: ctx => {
      const lifecycleService =
        ctx.container.get<LifecycleService>(LifecycleService);
      lifecycleService.dispose();
    },
  });
