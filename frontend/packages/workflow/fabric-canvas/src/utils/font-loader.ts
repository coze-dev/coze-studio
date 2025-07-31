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

import { type Canvas, type IText } from 'fabric';
import { QueryClient } from '@tanstack/react-query';

import { Mode, type FabricSchema } from '../typings';
import { getFontUrl, supportFonts } from '../assert/font';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export const loadFont = async (font: string): Promise<void> => {
  await queryClient.fetchQuery({
    queryKey: [font],
    queryFn: async () => {
      if (supportFonts.includes(font)) {
        const url = getFontUrl(font);
        const fontFace = new FontFace(font, `url(${url})`);
        document.fonts.add(fontFace);
        await fontFace.load();
      }
      return font;
    },
  });
};

export const loadFontWithSchema = ({
  schema,
  canvas,
  fontFamily,
}: {
  schema?: FabricSchema;
  canvas?: Canvas;
  fontFamily?: string;
}) => {
  let fonts: string[] = fontFamily ? [fontFamily] : [];
  if (schema) {
    fonts = schema.objects
      .filter(o => [Mode.INLINE_TEXT, Mode.BLOCK_TEXT].includes(o.customType))
      .map(o => o.fontFamily) as string[];
    fonts = Array.from(new Set(fonts));
  }

  fonts.forEach(async font => {
    await loadFont(font);
    canvas
      ?.getObjects()
      .filter(o => (o as IText)?.fontFamily === font)
      .forEach(o => {
        o.set({
          fontFamily: font,
        });
      });
    canvas?.requestRenderAll();
  });
};
