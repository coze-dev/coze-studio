import { type SchemaDecoration } from '@flowgram-adapter/common';

import { type ColorService } from './color-service';

interface PreferenceSchema {
  properties: Record<string, SchemaDecoration>;
}

interface ColorContribution {
  registerColors: (colors: ColorService) => void;
}

const ColorContribution = Symbol('ColorContribution');

export { ColorContribution, type PreferenceSchema };
