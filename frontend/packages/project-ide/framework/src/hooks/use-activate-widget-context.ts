import {
  useCurrentWidgetFromArea,
  LayoutPanelType,
} from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '@/widgets/project-ide-widget';
import { type WidgetContext } from '@/context/widget-context';

/**
 * 用于提供当前 focus 的 widget 上下文
 */
export const useActivateWidgetContext = (): WidgetContext => {
  const currentWidget = useCurrentWidgetFromArea(LayoutPanelType.MAIN_PANEL);
  return (currentWidget as ProjectIDEWidget)?.context;
};
