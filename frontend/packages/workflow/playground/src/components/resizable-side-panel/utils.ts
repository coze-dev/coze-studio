import { MIN_WIDTH } from './constants';

export function getConstraintWidth(width, max) {
  return Math.max(MIN_WIDTH, Math.min(max, width));
}
