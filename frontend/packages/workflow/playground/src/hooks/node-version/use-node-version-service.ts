import { useService } from '@flowgram-adapter/free-layout-editor';

import { NodeVersionService } from '@/services';

export const useNodeVersionService = () =>
  useService<NodeVersionService>(NodeVersionService);
