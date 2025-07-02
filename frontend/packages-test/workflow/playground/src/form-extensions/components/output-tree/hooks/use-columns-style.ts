import { TreeIndentWidth } from '../constants';

interface ColumnsStyle {
  name: React.CSSProperties;
  type: React.CSSProperties;
}

export function useColumnsStyle(columnsRatio = '3:2', level = 0): ColumnsStyle {
  const [nameWidth, typeWidth] = columnsRatio.split(':').map(Number);

  return {
    name: {
      flex: `${nameWidth} ${nameWidth} 0`,
    },
    type: {
      flex: `${typeWidth} ${typeWidth} ${(level * TreeIndentWidth * typeWidth) / nameWidth}px`,
      minWidth: '80px',
      maxWidth: '135px',
    },
  };
}
