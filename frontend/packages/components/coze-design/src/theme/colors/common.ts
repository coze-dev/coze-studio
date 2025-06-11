import { zinc } from './zinc';
import { yellow } from './yellow';
import { stroke } from './stroke';
import { red } from './red';
import { purple } from './purple';
import { orange } from './orange';
import { mask } from './mask';
import { magenta } from './magenta';
import { green } from './green';
import { foreground } from './foreground';
import { cyan } from './cyan';
import { brand } from './brand';
import { base } from './base';
import { background } from './background';

export const commonColors = {
  base,
  brand,
  red,
  stroke,
  mask,
  green,
  orange,
  purple,
  cyan,
  magenta,
  yellow,
  zinc,
  foreground,
  background,
};

export type CommonColors = typeof commonColors;
