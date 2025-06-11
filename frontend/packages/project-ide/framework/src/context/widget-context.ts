import { type URI } from '@coze-project-ide/client';

import { type ProjectIDEServices } from '../types';
import { type WidgetService } from '../plugins/create-preset-plugin/widget-service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WidgetContext<T = any> {
  uri?: URI; // 当前 widget 的 uri
  store: T; // 当前 widget 的 store
  widget: WidgetService;
  services: ProjectIDEServices; // 全局的 ide 服务
}

export const WidgetContext = Symbol('WidgetContext');
