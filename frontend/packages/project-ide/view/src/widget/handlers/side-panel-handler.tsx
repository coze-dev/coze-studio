import { injectable } from 'inversify';

import { type FlowDockPanel } from '../dock-panel';
import { Panel, BoxLayout, BoxPanel, PanelLayout } from '../../lumino/widgets';

export const SidePanelHandlerFactory = Symbol('SidePanelHandlerFactory');

/**
 * 侧边栏分级面板 handler
 */
@injectable()
export class SidePanelHandler {
  protected side: 'left' | 'right';

  container: Panel;

  contentPanel: Panel;

  dockPanel: FlowDockPanel;

  /**
   * Create the side bar and dock panel widgets.
   */
  create(side: 'left' | 'right'): void {
    this.side = side;
    this.container = this.createContainer();
  }

  protected createContainer(): Panel {
    const contentBox = new BoxLayout({
      direction: 'top-to-bottom',
      spacing: 0,
    });
    const contentPanel = new BoxPanel({ layout: contentBox });
    this.contentPanel = contentPanel;

    const { side } = this;
    let direction: BoxLayout.Direction;
    switch (side) {
      case 'left':
        direction = 'left-to-right';
        break;
      case 'right':
        direction = 'right-to-left';
        break;
      default:
        throw new Error(`Illegal argument: ${side}`);
    }
    const containerLayout = new BoxLayout({ direction, spacing: 0 });
    const sidebarContainerLayout = new PanelLayout();
    const sidebarContainer = new Panel({ layout: sidebarContainerLayout });
    sidebarContainer.addClass('flow-app-sidebar-container');

    this.contentPanel.layout = contentBox;
    BoxPanel.setStretch(sidebarContainer, 0);
    BoxPanel.setStretch(contentPanel, 1);
    containerLayout.addWidget(sidebarContainer);
    containerLayout.addWidget(contentPanel);
    const boxPanel = new BoxPanel({ layout: containerLayout });
    return boxPanel;
  }

  expand(id?: string) {
    this.container.show();
  }
}
