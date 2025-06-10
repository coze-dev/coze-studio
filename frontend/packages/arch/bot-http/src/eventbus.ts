import { GlobalEventBus } from '@coze-arch/web-context';

// api 请求有关事件
export enum APIErrorEvent {
  // 无登录状态
  UNAUTHORIZED = 'unauthorized',
  // 登录了 没权限
  NOACCESS = 'noAccess',
  // 风控拦截
  SHARK_BLOCK = 'sharkBlocked',
  // 国家限制
  COUNTRY_RESTRICTED = 'countryRestricted',
  // COZE TOKEN 不足
  COZE_TOKEN_INSUFFICIENT = 'cozeTokenInsufficient',
}

const getEventBus = () => GlobalEventBus.create<APIErrorEvent>('bot-http');

export const emitAPIErrorEvent = (event: APIErrorEvent, ...data: unknown[]) => {
  const evenBus = getEventBus();

  evenBus.emit(event, ...data);
};

export const handleAPIErrorEvent = (
  event: APIErrorEvent,
  fn: (...args: unknown[]) => void,
) => {
  const evenBus = getEventBus();

  evenBus.on(event, fn);
};

export const removeAPIErrorEvent = (
  event: APIErrorEvent,
  fn: (...args: unknown[]) => void,
) => {
  const evenBus = getEventBus();

  evenBus.off(event, fn);
};

export const stopAPIErrorEvent = () => {
  const evenBus = getEventBus();

  evenBus.stop();
};

export const startAPIErrorEvent = () => {
  const evenBus = getEventBus();

  evenBus.start();
};

export const clearAPIErrorEvent = () => {
  const evenBus = getEventBus();

  evenBus.clear();
};
