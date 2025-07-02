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
