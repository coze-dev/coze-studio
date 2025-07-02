import { useMemo } from 'react';

import { createToolAreaStore } from '../../store/tool-area';
import { createAgentAreaStore } from '../../store/agent-area';

export const useCreateStore = () => {
  const memoedUseToolAreaStore = useMemo(() => createToolAreaStore(), []);
  const memoedUseAgentAreaStore = useMemo(() => createAgentAreaStore(), []);

  return {
    useToolAreaStore: memoedUseToolAreaStore,
    useAgentAreaStore: memoedUseAgentAreaStore,
  };
};
