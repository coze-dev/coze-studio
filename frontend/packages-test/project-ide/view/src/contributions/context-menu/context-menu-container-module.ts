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
