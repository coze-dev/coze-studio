import { inject, injectable } from 'inversify';

import { DebugBarWidget } from '../widget/react-widgets/debug-bar-widget';
import { createPortal } from '../utils';
import { ApplicationShell } from '../shell/application-shell';
import { ViewOptions } from '../constants/view-options';

// 控制 debug
@injectable()
export class DebugService {
  @inject(ViewOptions) viewOptions: ViewOptions;

  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(DebugBarWidget) debugBarWidget: DebugBarWidget;

  show() {
    this.debugBarWidget.show();
    this.debugBarWidget.update();
  }

  hide() {
    this.debugBarWidget.hide();
    this.debugBarWidget.update();
  }

  createPortal() {
    const originRenderer = this.debugBarWidget.render.bind(this.debugBarWidget);
    const portal = createPortal(
      this.debugBarWidget,
      originRenderer,
      this.viewOptions.widgetFallbackRender!,
    );
    this.shell.node.insertBefore(this.debugBarWidget.node, null);
    this.hide();
    return portal;
  }
}
