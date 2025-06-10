import { useEffect } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { DisposableCollection } from '@flowgram-adapter/common';
import { WorkflowVariableFacadeService } from '@coze-workflow/variable';

export const useListenVariableChange = ({ variablePathList, callback }) => {
  const facadeService: WorkflowVariableFacadeService = useService(
    WorkflowVariableFacadeService,
  );

  useEffect(() => {
    callback();

    const toDispose = new DisposableCollection();
    variablePathList.forEach(path => {
      toDispose.push(
        facadeService.listenKeyPathTypeChange(path, () => {
          callback();
        }),
      );
    });
    return () => toDispose.dispose();
  }, [variablePathList, facadeService, callback]);
};
