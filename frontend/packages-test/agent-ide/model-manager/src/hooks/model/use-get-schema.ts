import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

import { getFixedSingleAgentSchema } from '../../utils/model/get-fixed-single-agent-schema';
import { convertModelParamsToSchema } from '../../utils/model/convert-model-params-to-schema';

export const useGetSchema = () => {
  const {
    storeSet: { useModelStore },
  } = useBotEditor();

  return ({
    currentModelId,
    isSingleAgent,
    diffType,
  }: {
    currentModelId: string;
    isSingleAgent: boolean;
    diffType?: 'prompt-diff' | 'model-diff';
  }) => {
    const { getModelById } = useModelStore.getState();

    const modelParams = getModelById(currentModelId)?.model_params ?? [];

    const schema = convertModelParamsToSchema({ model_params: modelParams });

    if (!isSingleAgent || diffType === 'model-diff') {
      return schema;
    }

    return getFixedSingleAgentSchema(schema);
  };
};
