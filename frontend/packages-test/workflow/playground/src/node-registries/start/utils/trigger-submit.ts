/* eslint-disable @typescript-eslint/naming-convention */
import { debounce, isUndefined } from 'lodash-es';
import {
  type LiteralExpression,
  type OutputValueVO,
} from '@coze-workflow/base/types';
import { workflowApi } from '@coze-workflow/base';
import { TriggerStatus } from '@coze-arch/idl/workflow_api';

import { TriggerForm } from '@/node-registries/trigger-upsert/types';

const submit = async ({
  workflowId,
  projectId,
  spaceId,
  eventId,
  config,
  parameters,
  isOpen,
  triggerId,
}: {
  workflowId?: string;
  projectId?: string;
  spaceId?: string;
  eventId?: string;
  config?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  isOpen?: boolean;
  triggerId?: string;
}) => {
  const data = await workflowApi.SaveTrigger({
    workflow_id: workflowId ?? '',
    project_id: projectId ?? '',
    space_id: spaceId ?? '',
    event_id: eventId ?? '',
    trigger_id: triggerId ?? '',
    config: JSON.stringify(config),
    payload: JSON.stringify(parameters),
    status: isOpen ? TriggerStatus.Open : TriggerStatus.Close,
  });

  return data?.trigger_id;
};

const requestDelay = 1000 * 1;
const submitThrottle = debounce(submit, requestDelay);

export interface TriggerSubmitOptions {
  parameters?: Record<string, unknown>;
  dynamicInputs?: Record<string, unknown>;
  outputs?: OutputValueVO[];
  workflowId?: string;
  projectId?: string;
  spaceId?: string;
  eventId?: string;
  triggerId?: string;
  isOpen?: boolean;
}
export async function triggerSubmit({
  parameters,
  dynamicInputs,
  outputs,
  workflowId,
  projectId,
  spaceId,
  eventId,
  triggerId,
  isOpen,
}: TriggerSubmitOptions): Promise<string | undefined> {
  const _parameters = {};
  outputs?.forEach(d => {
    const key = TriggerForm.getVariableName(d);
    if (!isUndefined(parameters?.[key])) {
      _parameters[d.name] = (parameters[key] as LiteralExpression)?.content;
    }
  });

  const config: Record<string, unknown> = {
    endTime: 4070880000,
    startTime: -1,
    schedulerType: 'custom',
  };

  Object.entries(dynamicInputs ?? {}).forEach(([k, v]) => {
    config[k] = (v as { content?: string })?.content ?? v;
  });

  config[TriggerForm.TriggerFormCronjobName] = (
    dynamicInputs?.[TriggerForm.TriggerFormCronjobName] as {
      content?: { content?: string };
    }
  )?.content?.content;

  config[TriggerForm.TriggerFormCronjobTypeName] = (
    dynamicInputs?.[TriggerForm.TriggerFormCronjobName] as { type: string }
  )?.type;

  const _triggerId = await submitThrottle({
    workflowId,
    projectId,
    spaceId,
    eventId,
    config,
    parameters: _parameters,
    isOpen,
    triggerId,
  });

  return _triggerId;
}
