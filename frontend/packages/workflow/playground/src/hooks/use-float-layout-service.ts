import { useState, useEffect } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowFloatLayoutService } from '@/services/workflow-float-layout-service';

export const useFloatLayoutService = () => {
  const floatLayoutService = useService(WorkflowFloatLayoutService);
  return floatLayoutService;
};

export const useFloatLayoutSize = () => {
  const floatLayoutService = useFloatLayoutService();
  const [size, setSize] = useState(floatLayoutService.size);

  useEffect(() => {
    const disposable = floatLayoutService.onSizeChange(setSize);
    return () => disposable.dispose();
  }, [floatLayoutService, setSize]);

  return size;
};
