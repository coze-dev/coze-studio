export type ColorScale =
  | Partial<{
      foreground: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      DEFAULT: string;
      [key: string | number]: string;
    }>
  | string;

export interface BaseColors {
  background: ColorScale;
  foreground: ColorScale;
  divider: ColorScale;
  overlay: ColorScale;
  focus: ColorScale;
  content1: ColorScale;
  content2: ColorScale;
  content3: ColorScale;
  content4: ColorScale;
}

export type ThemeColors = BaseColors & {
  default: ColorScale;
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  danger: ColorScale;
};

export interface SemanticBaseColors {
  light: BaseColors;
  dark: BaseColors;
}
