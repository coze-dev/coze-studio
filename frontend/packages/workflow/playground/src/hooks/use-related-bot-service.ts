import { useService } from '@flowgram-adapter/free-layout-editor';

import { RelatedCaseDataService } from '@/services';

export const useRelatedBotService = () =>
  useService<RelatedCaseDataService>(RelatedCaseDataService);
