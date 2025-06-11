import {
  PluginMode,
  PluginName,
  WriteableChatAreaPlugin,
} from '@coze-common/chat-area';

import { ResumeRenderLifeCycleService } from './life-cycle-service/render-life-cycle-service';
import { ResumeMessageLifeCycleService } from './life-cycle-service/message-life-cycle-service';

export class ResumePlugin extends WriteableChatAreaPlugin<unknown> {
  public pluginMode: PluginMode = PluginMode.Writeable;
  public pluginName: PluginName = PluginName.Resume;

  public lifeCycleServices = {
    messageLifeCycleService: new ResumeMessageLifeCycleService(this),
    renderLifeCycleService: new ResumeRenderLifeCycleService(this),
  };
}
