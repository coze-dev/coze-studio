import { useService } from '@flowgram-adapter/free-layout-editor';

import { TestRunService } from '../plugins/test-run-plugin';

export const useTestRunService = () =>
  useService<TestRunService>(TestRunService);
