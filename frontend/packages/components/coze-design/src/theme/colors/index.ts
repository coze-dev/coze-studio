import { semanticColors } from './semantic';
import { commonColors } from './common';

export type {
  ColorScale,
  BaseColors,
  ThemeColors,
  SemanticBaseColors,
} from './types';

export { getCommonItems } from './helper';

const colors = {
  ...commonColors,
  ...semanticColors,
};

export { colors, commonColors, semanticColors };
