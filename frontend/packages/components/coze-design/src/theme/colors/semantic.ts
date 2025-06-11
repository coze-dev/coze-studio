import type { ThemeColors, SemanticBaseColors } from './types';
import { commonColors as common } from './common';

const base: SemanticBaseColors = {
  light: {
    background: {
      DEFAULT: common.base.white,
    },
    foreground: {
      DEFAULT: common.base.black,
    },
    divider: {
      DEFAULT: common.stroke.light[5],
    },
    focus: {
      DEFAULT: common.red.light[5],
    },
    overlay: {
      DEFAULT: common.mask.light[5],
    },
    content1: {
      DEFAULT: common.base.white,
      foreground: common.foreground.light[4],
    },
    content2: {
      DEFAULT: common.zinc[100],
      foreground: common.zinc[800],
    },
    content3: {
      DEFAULT: common.zinc[200],
      foreground: common.zinc[700],
    },
    content4: {
      DEFAULT: common.zinc[300],
      foreground: common.zinc[600],
    },
  },
  dark: {
    background: {
      DEFAULT: common.base.black,
    },
    foreground: {
      DEFAULT: common.base.white,
    },
    focus: {
      DEFAULT: common.red.dark[5],
    },
    overlay: {
      DEFAULT: common.red.dark[5],
    },
    divider: {
      DEFAULT: common.stroke.dark[5],
    },
    content1: {
      DEFAULT: common.base.black,
      foreground: common.foreground.dark[4],
    },
    content2: {
      DEFAULT: common.zinc[800],
      foreground: common.zinc[100],
    },
    content3: {
      DEFAULT: common.zinc[700],
      foreground: common.zinc[200],
    },
    content4: {
      DEFAULT: common.zinc[600],
      foreground: common.zinc[300],
    },
  },
};

export const themeColorsLight: ThemeColors = {
  ...base.light,
  default: {
    ...common.zinc,
    foreground: common.base.black,
    DEFAULT: common.zinc[300],
  },
  primary: {
    ...common.brand.light,
    foreground: common.base.black,
    DEFAULT: common.brand.light[5],
  },
  secondary: {
    ...common.purple.light,
    foreground: common.base.black,
    DEFAULT: common.purple.light[5],
  },
  success: {
    ...common.green.light,
    foreground: common.base.black,
    DEFAULT: common.green.light[5],
  },
  warning: {
    ...common.yellow.light,
    foreground: common.base.black,
    DEFAULT: common.yellow.light[5],
  },
  danger: {
    ...common.red.light,
    foreground: common.base.black,
    DEFAULT: common.red.light[5],
  },
};

export const themeColorsDark: ThemeColors = {
  ...base.dark,
  default: {
    ...common.zinc,
    foreground: common.base.white,
    DEFAULT: common.zinc[700],
  },
  primary: {
    ...common.brand.dark,
    foreground: common.base.white,
    DEFAULT: common.brand.dark[5],
  },
  secondary: {
    ...common.purple.dark,
    foreground: common.base.white,
    DEFAULT: common.purple.dark[5],
  },
  success: {
    ...common.green.dark,
    foreground: common.base.white,
    DEFAULT: common.green.dark[5],
  },
  warning: {
    ...common.yellow.dark,
    foreground: common.base.white,
    DEFAULT: common.yellow.dark[5],
  },
  danger: {
    ...common.red.dark,
    foreground: common.base.white,
    DEFAULT: common.red.dark[5],
  },
};

export const semanticColors = {
  light: themeColorsLight,
  dark: themeColorsDark,
};
