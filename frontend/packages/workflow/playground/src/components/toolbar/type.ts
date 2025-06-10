import type { PlaygroundTools } from '@flowgram-adapter/free-layout-editor';

export interface ToolbarHandlers extends PlaygroundTools {
  minimapVisible: boolean;
  setMinimapVisible: (visible: boolean) => void;
  addNode: (targetBoundingRect: DOMRect) => Promise<void>;
}

export interface ITool {
  handlers: ToolbarHandlers;
}
