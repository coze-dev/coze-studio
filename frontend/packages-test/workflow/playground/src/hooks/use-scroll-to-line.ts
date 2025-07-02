import {
  usePlayground,
  SelectionService,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { type PlaygroundConfigRevealOpts } from '@flowgram-adapter/free-layout-editor';
import { Rectangle, SizeSchema } from '@flowgram-adapter/common';

import { useLineService } from './use-line-service';

export const useScrollToLine = () => {
  const lineService = useLineService();
  const playground = usePlayground();

  const selectionService = useService<SelectionService>(SelectionService);

  const scrollToLine = async (fromId: string, toId: string) => {
    const line = lineService.getLine(fromId, toId);
    let success = false;
    if (line) {
      const bounds = Rectangle.enlarge([line.bounds]).pad(30, 30);

      const viewport = playground.config.getViewport(false);
      const zoom = SizeSchema.fixSize(bounds, viewport);

      const scrollConfig: PlaygroundConfigRevealOpts = {
        bounds,
        zoom,
        scrollToCenter: true,
        easing: true,
      };

      selectionService.selection = [line];

      await playground.config.scrollToView(scrollConfig);
      success = true;
    }
    return success;
  };

  return scrollToLine;
};
