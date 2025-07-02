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
