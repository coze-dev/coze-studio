/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ConnectionOptions {
  // 调用的业务参数，对应消息结构中的headers['X-Coze-Biz']
  biz: string;
  // 发送给的服务的id
  service?: number;
  // 是否接受所有消息。默认false, onMessage只会emit biz相关消息
  acceptAllBizMessages?: boolean;
  // 接受的biz消息, 默认是传入的biz
  acceptBiz?: string[];
  // fws 初始化参数
  fwsOptions?: any;
}

export interface FrontierEventMap {
  error: any;
  message: any;
  open: any;
  close: any;
  ack: any;
}

export class Connection {
  readonly service?: number;

  constructor(props: ConnectionOptions, channel: any) {}

  /**
   * 获取建连参数
   */
  getInitConfig() {}

  getLaunchConfig() {}

  /**
   * 监听fws
   */
  addEventListener(event: string, listener: (data: any) => void) {}

  /**
   * 移除fws监听
   */
  removeEventListener<T extends keyof Record<string, any>>(
    event: T,
    listener: (data: Record<string, any>[T]) => void,
  ) {}

  send(data: any, options: any = {}) {}

  reconnect() {}

  pingOnce() {}

  // 关闭connection, 需要通知manager, 由它决定是否真正关闭通道
  close() {}

  destroy() {}
}

export class WebSocketManager {
  deviceId = '';

  channel: any = null;

  /**
   * 创建一个connection实例
   */
  createConnection(options: ConnectionOptions): Connection {
    return new Connection(options, this.channel);
  }

  /**
   * 创建一个新的ws通道，不复用现有通道
   */
  createChannel(options: ConnectionOptions) {}
}

export default new WebSocketManager();
