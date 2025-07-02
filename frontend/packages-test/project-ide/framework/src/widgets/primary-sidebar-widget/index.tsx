import { injectable, type interfaces } from 'inversify';
import { SplitWidget, type URI } from '@coze-project-ide/client';

import { type WidgetContext } from '@/context';

import { SIDEBAR_RESOURCE_URI, SIDEBAR_CONFIG_URI } from '../../constants/uri';
import { ResourceWidget } from './resource-widget';
import { ConfigWidget } from './config-widget';

@injectable()
export class PrimarySidebarWidget extends SplitWidget {
  context: WidgetContext;

  container: interfaces.Container;

  render(): any {
    return null;
  }

  init(uri: URI) {
    this.orientation = 'vertical';
    this.defaultStretch = [0.7, 0.3];
    this.splitPanels = [
      {
        widgetUri: SIDEBAR_RESOURCE_URI,
        widget: ResourceWidget,
        order: 1,
      },
      {
        widgetUri: SIDEBAR_CONFIG_URI,
        widget: ConfigWidget,
        order: 2,
      },
    ];
    super.init(uri);
  }
}
