/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
