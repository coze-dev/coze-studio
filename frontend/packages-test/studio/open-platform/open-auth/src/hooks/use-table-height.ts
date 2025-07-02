import { useState, useEffect } from 'react';

export const useTableHeight = (tableRef: React.RefObject<HTMLDivElement>) => {
  const [tableHeight, setTableHeight] = useState<string>('calc(100vh - 360px)');

  useEffect(() => {
    if (!tableRef.current) {
      return;
    }
    const calculateHeight = () => {
      if (tableRef.current) {
        const topPosition = tableRef.current.getBoundingClientRect().top;
        setTableHeight(`calc(100vh - ${topPosition + 80}px)`);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [tableRef.current]);

  return tableHeight;
};
