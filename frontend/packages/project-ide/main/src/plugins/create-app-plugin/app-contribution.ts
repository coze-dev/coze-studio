/**
 * project ide app 的生命周期
 */
import { injectable, inject } from 'inversify';
import {
  type LifecycleContribution,
  LayoutRestorer,
  Emitter,
} from '@coze-project-ide/framework';

import { WidgetEventService } from './widget-event-service';
import { ProjectInfoService } from './project-info-service';
import { OpenURIResourceService } from './open-url-resource-service';

@injectable()
export class AppContribution implements LifecycleContribution {
  @inject(OpenURIResourceService)
  private openURIResourceService: OpenURIResourceService;

  @inject(WidgetEventService)
  private widgetEventService: WidgetEventService;

  @inject(LayoutRestorer)
  private layoutRestorer: LayoutRestorer;

  @inject(ProjectInfoService)
  private projectInfoService: ProjectInfoService;

  onStartedEmitter = new Emitter<void>();
  onStarted = this.onStartedEmitter.event;

  // ide 初始化完成，可执行业务逻辑的时机
  onStart() {
    // 更新项目信息
    this.projectInfoService.init();

    // // 打开 url 上携带的资源
    this.openURIResourceService.open();
    this.openURIResourceService.listen();
    // 订阅变化事件
    this.widgetEventService.listen();
    // listen layout store
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.layoutRestorer.listen();
    this.onStartedEmitter.fire();
  }

  onDispose() {
    // 销毁所有的订阅
    this.widgetEventService.dispose();
    this.openURIResourceService.dispose();
    this.onStartedEmitter.dispose();
  }
}
