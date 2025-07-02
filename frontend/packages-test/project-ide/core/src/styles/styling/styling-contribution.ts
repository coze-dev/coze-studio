import { type Theme } from '../types';

interface Collector {
  prefix: string;
  add: (rule: string) => void;
}
type ColorTheme = Pick<Theme, 'type' | 'label'> & {
  getColor: (id: string) => string;
};

interface StylingContribution {
  registerStyle: (collector: Collector, theme: ColorTheme) => void;
}
const StylingContribution = Symbol('StylingContribution');

export { type Collector, type ColorTheme, StylingContribution };
