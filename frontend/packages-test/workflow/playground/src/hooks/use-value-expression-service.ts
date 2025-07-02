import { useService } from '@flowgram-adapter/free-layout-editor';

import { ValueExpressionService } from '@/services/value-expression-service';

export const useValueExpressionService = () => {
  const valueExpressionService = useService<ValueExpressionService>(
    ValueExpressionService,
  );
  return valueExpressionService;
};
