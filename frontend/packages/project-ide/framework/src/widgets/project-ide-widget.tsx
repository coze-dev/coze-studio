import { type interfaces } from 'inversify';
import { Emitter, ReactWidget } from '@coze-project-ide/client';

import { type WidgetContext } from '@/context/widget-context';

export class ProjectIDEWidget extends ReactWidget {
  context: WidgetContext;

  container: interfaces.Container;

  private onRefreshEmitter = new Emitter<void>();

  onRefresh = this.onRefreshEmitter.event;

  refresh() {
    this.onRefreshEmitter.fire();
  }

  constructor(props) {
    super(props);
    this.scrollOptions = {
      minScrollbarLength: 35,
    };
  }

  render(): any {
    return null;
  }
}
