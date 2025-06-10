/**
 * theme
 */
type ThemeType = 'light' | 'dark';

interface Theme {
  readonly id: string;
  readonly type: ThemeType;
  readonly label: string;
  readonly description?: string;
}

/**
 * color
 */
type Color = string;

type ColorDefaults = Required<Record<ThemeType, Color>>;

interface ColorDefinition {
  id: string;
  defaults: ColorDefaults;
  description?: string;
}

export type { ThemeType, Theme, Color, ColorDefaults, ColorDefinition };
