import { type GlobalStyle, type LineStyle } from './typing';

export const defaultGlobalStyle: GlobalStyle = {
  indent: 24,
  verticalInterval: 16,
  nodeBoxHeight: 16,
  offsetX: 8,
};

export const defaultLineStyle: LineStyle = {
  normal: {
    stroke: '#ccc',
    strokeDasharray: '[]',
    strokeWidth: 2,
    lineRadius: 6,
    lineGap: 0,
  },
  select: {
    stroke: '#333',
  },
  hover: {
    stroke: '#d25e5a',
  },
};
