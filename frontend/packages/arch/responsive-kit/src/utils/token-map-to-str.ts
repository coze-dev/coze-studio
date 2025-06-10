import { type ResponsiveTokenMap } from '../types';
import { type ScreenRange } from '../constant';

export const tokenMapToStr = (
  tokenMap: ResponsiveTokenMap<ScreenRange>,
  prefix: string,
): string =>
  Object.entries(tokenMap)
    .map(([k, v]) => `${k === 'basic' ? '' : `${k}:`}${prefix}-${v}`)
    .join(' ');
