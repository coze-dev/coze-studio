import { URI, useIDEService, WidgetManager } from '@coze-project-ide/client';

import { type ProjectIDEWidget } from '../widgets/project-ide-widget';
import { URI_SCHEME } from '../constants';

export const useGetUIWidgetFromId = (
  value: string,
): ProjectIDEWidget | undefined => {
  const widgetManager = useIDEService<WidgetManager>(WidgetManager);
  const uri = new URI(`${URI_SCHEME}://${value}`);
  const widget = widgetManager.getWidgetFromURI(uri) as ProjectIDEWidget;
  return widget;
};
