import { useEffect, useState } from 'react';

import { FlowNodeVariableData } from '@coze-workflow/variable';

export const useVariableChange = nodes => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const disposables = nodes
      .filter(node => node.getData(FlowNodeVariableData)?.public?.available)
      .map(node =>
        node.getData(FlowNodeVariableData).public.available.onDataChange(() => {
          setVersion(version + 1);
        }),
      );
    return () => {
      disposables.forEach(disposable => disposable?.dispose());
    };
  }, [nodes, version]);

  return {
    version,
  };
};
