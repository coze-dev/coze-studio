const DECIMAL = 60;
const UNIT_MILLISECOND = 1000;
const UNIT_SECOND = DECIMAL * UNIT_MILLISECOND;
const UNIT_MINUTES = DECIMAL * UNIT_SECOND;
const UNIT_HOUR = DECIMAL * UNIT_MINUTES;

export function formatDuration(time: number) {
  if (time < UNIT_MILLISECOND) {
    return `${time}ms`;
  } else if (time < UNIT_SECOND) {
    return `${(time / UNIT_MILLISECOND).toFixed(2)}s`;
  } else if (time < UNIT_MINUTES) {
    return `${(time / UNIT_SECOND).toFixed(2)}min`;
  } else if (time < UNIT_HOUR) {
    return `${(time / UNIT_MINUTES).toFixed(2)}h`;
  } else {
    return `${(time / UNIT_HOUR).toFixed(2)}d`;
  }
}
