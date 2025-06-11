export enum ScreenRange {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XL1_5 = 'xl1.5',
  XL2 = '2xl',
}

export const SCREENS_TOKENS = {
  [ScreenRange.SM]: '640px',
  [ScreenRange.MD]: '768px',
  [ScreenRange.LG]: '1200px',
  [ScreenRange.XL]: '1600px',
  [ScreenRange.XL1_5]: '1680px',
  [ScreenRange.XL2]: '1920px',
};

export const SCREENS_TOKENS_2 = {
  [ScreenRange.XL1_5]: '1680px',
};

export type ResponsiveTokenMap = Partial<Record<ScreenRange | 'basic', number>>;
