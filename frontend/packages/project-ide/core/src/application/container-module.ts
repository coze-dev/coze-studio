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

import { ContainerModule, type interfaces } from 'inversify';
import { bindContributionProvider } from '@flowgram-adapter/common';

import {
  OpenHandler,
  DefaultOpenerService,
  OpenerService,
} from '../common/open-service';
import {
  PluginContext,
  LifecycleContribution,
  ContainerFactory,
  ContextKeyService,
  ContextMatcher,
  StorageService,
  LocalStorageService,
  WindowService,
} from '../common';
import { Application } from './application';

export const IDEContainerModule = new ContainerModule(bind => {
  bind(Application).toSelf().inSingletonScope();
  bindContributionProvider(bind, OpenHandler);
  bind(DefaultOpenerService).toSelf().inSingletonScope();
  bind(WindowService).toSelf().inSingletonScope();
  bind(OpenerService).toService(DefaultOpenerService);

  bind(ContextKeyService).toSelf().inSingletonScope();
  bind(ContextMatcher).toService(ContextKeyService);

  bind(PluginContext)
    .toDynamicValue(ctx => ({
      get<T>(identifier: interfaces.ServiceIdentifier<T>): T {
        return ctx.container.get<T>(identifier);
      },
      getAll<T>(identifier: interfaces.ServiceIdentifier<T>): T[] {
        return ctx.container.getAll<T>(identifier);
      },
      container: ctx.container,
    }))
    .inSingletonScope();
  bind(ContainerFactory)
    .toDynamicValue(ctx => ctx.container)
    .inSingletonScope();
  bindContributionProvider(bind, LifecycleContribution);
  bind(StorageService).to(LocalStorageService).inSingletonScope();
});
