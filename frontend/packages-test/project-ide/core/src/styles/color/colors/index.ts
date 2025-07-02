import { viewColors } from './view-colors';
import * as baseColors from './base-colors';

const colors = [...Object.values(baseColors), ...viewColors];

export { colors };
