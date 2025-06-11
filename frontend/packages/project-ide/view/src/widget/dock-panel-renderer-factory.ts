import { type DockLayout } from '../lumino/widgets';
interface DockPanelRenderer extends DockLayout.IRenderer {}

interface DockPanelRendererFactory {
  (): DockPanelRenderer;
}

const DockPanelRendererFactory = Symbol('DockPanelRendererFactory');

export { type DockPanelRenderer, DockPanelRendererFactory };
