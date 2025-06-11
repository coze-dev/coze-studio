import { useLayoutEffect, useState } from 'react';

import { LoggerEvent, LoggerService, useService } from '@flowgram-adapter/free-layout-editor';

export function useNodesMount() {
  const [isMounted, setMounted] = useState(false);
  const loggerService = useService<LoggerService>(LoggerService);

  useLayoutEffect(() => {
    const disposable = loggerService.onLogger(({ event }) => {
      if (event === LoggerEvent.CANVAS_TTI) {
        setMounted(true);
      }
    });

    return () => {
      disposable?.dispose();
    };
  }, []);

  return isMounted;
}
