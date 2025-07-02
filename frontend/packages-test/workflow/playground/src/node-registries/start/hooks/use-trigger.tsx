import { useCallback, useEffect, useMemo, useRef } from 'react';

import { debounce } from 'lodash-es';
import { useLatest } from 'ahooks';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { TriggerForm } from '@coze-workflow/nodes';
import {
  ValueExpressionType,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';

import { TriggerService } from '@/services';
import { useGlobalState } from '@/hooks';
import { useForm, useWatch } from '@/form';

import {
  triggerSubmit,
  type TriggerSubmitOptions,
} from '../utils/trigger-submit';

export const useTrigger = () => {
  const triggerService = useService<TriggerService>(TriggerService);

  const { dynamicFormMeta, eventId } = useMemo(() => {
    const formMeta = triggerService.getTriggerDynamicFormMeta();

    return {
      dynamicFormMeta: formMeta?.startNodeFormMeta,
      eventId: formMeta?.[TriggerForm.TriggerFormEventIdName],
    };
  }, []);

  const formValue = triggerService.getStartNodeFormValues();
  const { triggerId } = (formValue ?? {}) as {
    triggerId?: string;
  };

  const outputs = useWatch<ViewVariableTreeNode[]>('outputs');

  const triggerIsOpen = useWatch<boolean>('trigger.isOpen');
  const form = useForm();
  const setTriggerIsOpen = useCallback(
    (_isOpen: boolean) => {
      form.setValueIn('trigger.isOpen', _isOpen);
      onDynamicFormChange();
    },
    [form],
  );

  const triggerValues = useWatch<{
    dynamicInputs: Record<string, unknown>;
    parameters: Record<string, unknown>;
  }>('trigger');

  const latestTriggerValues = useLatest(triggerValues);

  const triggerValueSubmitProps = useRef<Partial<TriggerSubmitOptions>>({});
  const { workflowId, projectId, spaceId } = useGlobalState();
  useEffect(() => {
    triggerValueSubmitProps.current = {
      triggerId,
      outputs,
      workflowId,
      projectId,
      spaceId,
      eventId,
    };
  }, [workflowId, projectId, spaceId, triggerId, outputs, eventId]);

  const onDynamicFormChange = useCallback(async () => {
    if (latestTriggerValues.current) {
      triggerService.setStartNodeFormValues({
        ...latestTriggerValues.current,
        parameters: form.getValueIn('trigger.parameters'),
        dynamicInputs: form.getValueIn('trigger.dynamicInputs'),
        isOpen: form.getValueIn('trigger.isOpen'),
      });
      const _triggerId = await triggerSubmit({
        ...triggerValueSubmitProps.current,
        parameters: form.getValueIn('trigger.parameters'),
        dynamicInputs: form.getValueIn('trigger.dynamicInputs'),
        isOpen: form.getValueIn('trigger.isOpen'),
      });
      if (!triggerValueSubmitProps.current?.triggerId) {
        triggerValueSubmitProps.current.triggerId = _triggerId;
      }
    }
  }, []);

  useEffect(() => {
    outputs?.map(d => {
      const k = TriggerForm.getVariableName(d);
      if (!form.getValueIn(`trigger.parameters.${k}`)) {
        form.setValueIn(`trigger.parameters.${k}`, {
          type: ValueExpressionType.LITERAL,
        });
      }
    });
  }, [outputs?.map(d => TriggerForm.getVariableName(d)).join('')]);

  return {
    triggerIsOpen,
    setTriggerIsOpen,
    triggerId,
    dynamicFormMeta,
    outputs,
    onDynamicFormChange: debounce(onDynamicFormChange, 100),
  };
};
