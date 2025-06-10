export const componentPositions = [
  'top',
  'topLeft',
  'topRight',
  'left',
  'leftTop',
  'leftBottom',
  'right',
  'rightTop',
  'rightBottom',
  'bottom',
  'bottomLeft',
  'bottomRight',
  'leftTopOver',
  'rightTopOver',
  'leftBottomOver',
  'rightBottomOver',
] as const;

export const componentShapes = ['circle', 'square'] as const;

export const componentSizes = [
  'default',
  'large',
  'small',
  'middle',
  'none',
  'sm',
  'base',
  'md',
  'lg',
  'xl',
] as const;
export const componentRadius = [
  'none',
  'sm',
  'base',
  'md',
  'lg',
  'full',
] as const;
export const baseColor = [
  'brand',
  'red',
  'yellow',
  'green',
  'orange',
  'cyan',
  'purple',
  'magenta',
  'light',
  'dark',
] as const;

export const componentStatuses = [
  'info',
  'success',
  'warning',
  'danger',
  'error',
  'link',
] as const;

export const bgVariant = ['primary', 'secondary', 'tertiary'] as const;

export const componentColors = [
  ...baseColor,
  ...bgVariant,
  ...componentStatuses,
] as const;

export const bgColors = [
  'base-100',
  'base-200',
  'base-300',
  'neutral',
] as const;

export const monochrome = [
  'normal',
  'bgNormal',
  'bgDialog',
  'bgDialogElevation',
  'bgPageElevation',
  'bgPage',
  'bgCard',
] as const;

export const tone = ['solid', 'light', 'outline', 'transparent'];

export const defaultTheme = 'light';
