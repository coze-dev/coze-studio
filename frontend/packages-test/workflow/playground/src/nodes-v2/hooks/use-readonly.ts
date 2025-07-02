import { useEffect } from 'react';

import {
  PlaygroundConfigEntity,
  useConfigEntity,
  useRefresh,
} from '@flowgram-adapter/free-layout-editor';
export function useReadonly() {
  const playgroundConfig = useConfigEntity<PlaygroundConfigEntity>(
    PlaygroundConfigEntity,
  );

  const refresh = useRefresh();

  useEffect(() => {
    const disposable = playgroundConfig.onReadonlyOrDisabledChange(() => {
      refresh();
    });

    return () => {
      disposable.dispose();
    };
  }, []);

  return playgroundConfig.readonly;
}
