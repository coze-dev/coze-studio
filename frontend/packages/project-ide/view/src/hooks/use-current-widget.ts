import { useContext } from 'react';

import { type ReactWidget, ReactWidgetContext } from '../widget/react-widget';

export function useCurrentWidget<T extends ReactWidget>(): T {
  const widget = useContext<ReactWidget | undefined>(ReactWidgetContext);
  if (widget?.wrapperWidget) {
    return widget?.wrapperWidget as T;
  }
  if (!widget) {
    throw new Error(
      '[useCurrentWidget] Undefined react widget from ide context',
    );
  }
  return widget as T;
}
