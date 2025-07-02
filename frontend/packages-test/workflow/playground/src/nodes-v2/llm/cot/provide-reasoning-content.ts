import {
  type Effect,
  DataEvent,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableTreeNode } from '@coze-workflow/base';

import { WorkflowModelsService } from '@/services';

import { getOutputs } from './utils';

function createEffect(): Effect {
  return ({ value, context: { node } }) => {
    const modelType = value?.modelType;

    const form = node
      ?.getData(FlowNodeFormData)
      ?.getFormModel<FormModelV2>()?.nativeFormModel;

    if (!form || !modelType) {
      return;
    }

    const outputs = form.getValueIn<ViewVariableTreeNode[] | undefined>(
      'outputs',
    );

    const isBatch = form.getValueIn('batchMode') === 'batch';
    const modelsService = node.getService(WorkflowModelsService);

    form.setValueIn(
      'outputs',
      getOutputs({ modelType, outputs, isBatch, modelsService }),
    );
  };
}

export const provideReasoningContentEffect = [
  {
    effect: createEffect(),
    event: DataEvent.onValueChange,
  },
];
