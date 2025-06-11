import { useCurrentWidget } from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '@/widgets/project-ide-widget';

import { type WidgetContext } from '../context/widget-context';

/**
 * 获取当前的 WidgetContext
 * 在 registry 的 renderContent 内调用
 */
export function useCurrentWidgetContext<T>(): WidgetContext<T> {
  const currentWidget = useCurrentWidget() as ProjectIDEWidget;
  if (!currentWidget.context) {
    throw new Error(
      '[useWidgetContext] Undefined widgetContext from ide context',
    );
  }
  return currentWidget.context as WidgetContext<T>;
}
