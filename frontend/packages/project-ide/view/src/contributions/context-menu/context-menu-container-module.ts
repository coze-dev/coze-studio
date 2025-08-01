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

import { ContainerModule } from 'inversify';
import { bindContributions } from '@flowgram-adapter/common';
import { LifecycleContribution } from '@coze-project-ide/core';

import { MenuService, MenuRegistry } from './menu-registry';
import { Menu, MenuFactory } from './menu';
import { ContextMenu } from './context-menu';

export const ContextMenuContainerModule = new ContainerModule(bind => {
  bind(MenuService).toService(MenuRegistry);
  bindContributions(bind, MenuRegistry, [LifecycleContribution]);

  bind(MenuFactory).toFactory(context => () => {
    const container = context.container.createChild();
    container.bind(Menu).toSelf().inSingletonScope();
    return container.get(Menu);
  });
  bind(ContextMenu).toSelf().inSingletonScope();
});
