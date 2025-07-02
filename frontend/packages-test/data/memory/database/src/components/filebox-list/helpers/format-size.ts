export enum Size {
  B = 'B',
  KB = 'KB',
  MB = 'MB',
  GB = 'GB',
}
const sizeB = 1024;
const sizeKB = 1024 * sizeB;
const sizeMB = 1024 * sizeKB;
const sizeGB = 1024 * sizeMB;

export const formatFixed = (v: number) => v.toFixed(2);

export const formatSize = (v: number): string => {
  if (v > 0 && v < sizeB) {
    return `${formatFixed(v)}${Size.B}`;
  } else if (v < sizeKB) {
    return `${formatFixed(v / sizeB)}${Size.KB}`;
  } else if (v < sizeMB) {
    return `${formatFixed(v / sizeKB)}${Size.MB}`;
  } else if (v < sizeGB) {
    return `${formatFixed(v / sizeMB)}${Size.MB}`;
  }
  return `${formatFixed(v / sizeMB)}${Size.MB}`;
};
