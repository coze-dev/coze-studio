import { type CustomComponent } from '../../types/plugin-component';
import { type ChatAreaPluginContext } from '../../types/plugin-class/chat-area-plugin-context';
import { PluginMode, type PluginName } from '../../constants/plugin';

export abstract class ChatAreaPlugin<
  U extends PluginMode = PluginMode.Readonly,
  T = unknown,
  K = unknown,
> {
  /**
   * 业务方自持的业务Context信息
   */
  public pluginBizContext: T;
  /**
   * 插件名称
   */
  public abstract pluginName: PluginName;
  /**
   * 插件模式
   * @enum PluginMode.Readonly - 只读
   * @enum PluginMode.Writeable - 可写
   */
  public pluginMode: PluginMode = PluginMode.Readonly;
  /**
   * ChatArea提供的上下文
   */
  public chatAreaPluginContext: ChatAreaPluginContext<U>;
  /**
   * 自定义组件
   */
  public customComponents?: Partial<CustomComponent>;
  constructor(
    pluginBizContext: T,
    chatAreaPluginContext: ChatAreaPluginContext<U>,
  ) {
    this.pluginBizContext = pluginBizContext;
    this.chatAreaPluginContext = chatAreaPluginContext;
  }
  /**
   * 业务方请勿使用：注入ChatAreaContext信息
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public _injectChatAreaContext(
    chatAreaPluginContext: ChatAreaPluginContext<U>,
  ) {
    if (this.chatAreaPluginContext) {
      console.error('Repeat inject chat area context');
      return;
    }

    this.chatAreaPluginContext = chatAreaPluginContext;
  }

  /**
   * 对外暴露的公共方法
   */
  public publicMethods?: K;
}

export abstract class ReadonlyChatAreaPlugin<
  T = unknown,
  K = unknown,
> extends ChatAreaPlugin<PluginMode.Readonly, T, K> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- 需要透传
  constructor(
    pluginBizContext: T,
    chatAreaPluginContext: ChatAreaPluginContext<PluginMode.Readonly>,
  ) {
    super(pluginBizContext, chatAreaPluginContext);
  }
}

export abstract class WriteableChatAreaPlugin<
  T = unknown,
  K = unknown,
> extends ChatAreaPlugin<PluginMode.Writeable, T, K> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    pluginBizContext: T,
    chatAreaPluginContext: ChatAreaPluginContext<PluginMode.Writeable>,
  ) {
    super(pluginBizContext, chatAreaPluginContext);
  }
}
