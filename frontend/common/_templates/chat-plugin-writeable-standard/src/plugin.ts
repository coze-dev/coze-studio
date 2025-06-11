import {
  PluginMode,
  PluginName,
  WriteableChatAreaPlugin,
  createCustomComponents,
  createWriteableLifeCycleServices,
} from '@coze-common/chat-area';

import { type PluginBizContext } from './types/biz-context';
import { bizLifeCycleServiceGenerator } from './services/life-cycle';
import { BizMessageInnerAddonBottom } from './custom-components/message-inner-addon-bottom';

export class BizPlugin extends WriteableChatAreaPlugin<PluginBizContext> {
  /**
   * 插件类型
   * PluginMode.Readonly = 只读模式
   * PluginMode.Writeable = 可写模式
   */
  public pluginMode = PluginMode.Writeable;
  /**
   * 插件名称
   * 请点 PluginName 里面去定义
   */
  public pluginName = PluginName.Demo;

  /**
   * 生命周期服务
   */
  public lifeCycleServices = createWriteableLifeCycleServices(
    this,
    bizLifeCycleServiceGenerator,
  );

  /**
   * 自定义组件
   */
  public customComponents = createCustomComponents({
    MessageInnerBottomSlot: BizMessageInnerAddonBottom,
  });
}
