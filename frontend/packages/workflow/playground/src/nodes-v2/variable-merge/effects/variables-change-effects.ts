import {
  createEffectOptions,
  DataEvent,
  type Effect,
  type FlowNodeEntity,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { type WorkflowVariableService } from '@coze-workflow/variable';

export const variablesChangeEffects = [
  createEffectOptions<Effect>(DataEvent.onValueChange, params => {
    const { node } = params.context as {
      node: FlowNodeEntity;
      playgroundContext: { variableService: WorkflowVariableService };
    };
    const formModel = node
      ?.getData(FlowNodeFormData)
      ?.getFormModel<FormModelV2>()?.nativeFormModel;

    if (!formModel) {
      return;
    }

    // todo any类型需要sdk导出
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (formModel.getField(params.name) as any)?.map(child => {
      child?.validate();
    });
  }),
];
