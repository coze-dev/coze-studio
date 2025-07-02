import { TreeIndentWidth } from '../constants';

interface ColumnsStyle {
  name: React.CSSProperties;
  value: React.CSSProperties;
}

export function useColumnsStyle(columnsRatio = '3:2', level = 0): ColumnsStyle {
  const [nameWidth, valueWidth] = columnsRatio.split(':').map(Number);

  return {
    name: {
      flex: `${nameWidth} ${nameWidth} 0`,
    },
    value: {
      flex: `${valueWidth} ${valueWidth} ${(level * TreeIndentWidth * valueWidth) / nameWidth}px`,
    },
  };
}
