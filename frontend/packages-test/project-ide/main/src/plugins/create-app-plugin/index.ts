/**
 * 承载 project ide app 业务逻辑的插件
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
