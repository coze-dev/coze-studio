import { useState } from 'react';

import { useRequest } from 'ahooks';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import {
  type SchemaAreaPage,
  SchemaAreaPageApi,
  type GetBindConnectorConfigResponse,
  type SaveBindConnectorConfigResponse,
  type BindConnectorResponse,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';
import { useParams } from 'react-router-dom';

export type ActionResponse =
  | {
      action: SchemaAreaPageApi.BindConnector;
      data: BindConnectorResponse;
    }
  | {
      action: SchemaAreaPageApi.GetBindConnectorConfig;
      data: GetBindConnectorConfigResponse;
    }
  | {
      action: SchemaAreaPageApi.SaveBindConnectorConfig;
      data: SaveBindConnectorConfigResponse;
    }
  | {
      action: SchemaAreaPageApi.NotQuery;
      data: undefined;
    };

interface StepActionProps {
  botId: string;
  origin?: 'bot' | 'project';
  schemaPages: SchemaAreaPage[];
  onNextStepSuccess: (resp: ActionResponse) => void;
  onNextStepError: (error: Error) => void;
}
interface StepRunParams {
  connectorId: string;
  assignFormValue: Record<string, string>;
}

export const useStepAction = ({
  botId,
  origin = 'bot',
  schemaPages,
  onNextStepSuccess,
  onNextStepError,
}: StepActionProps) => {
  const [step, setStep] = useState(0);

  const { space_id = '' } = useParams<DynamicParams>();

  const agentType = origin === 'bot' ? 0 : 1;

  const currentAction =
    schemaPages?.[step]?.api_action ?? SchemaAreaPageApi.BindConnector;

  const SERVICE_MAP = {
    [SchemaAreaPageApi.NotQuery]: async () => await Promise.resolve(),
    [SchemaAreaPageApi.GetBindConnectorConfig]: async (
      params?: StepRunParams,
    ) => {
      const data = await DeveloperApi.GetBindConnectorConfig({
        connector_id: params?.connectorId ?? '',
        detail: params?.assignFormValue ?? {},
        agent_type: agentType,
        bot_id: botId,
        space_id,
      });
      return data;
    },
    [SchemaAreaPageApi.SaveBindConnectorConfig]: async (
      params?: StepRunParams,
    ) => {
      const data = await DeveloperApi.SaveBindConnectorConfig({
        connector_id: params?.connectorId ?? '',
        detail: params?.assignFormValue ?? {},
        agent_type: agentType,
        bot_id: botId,
        space_id,
      });
      return data;
    },
    [SchemaAreaPageApi.BindConnector]: async (params?: StepRunParams) => {
      const res = await DeveloperApi.BindConnector(
        {
          connector_id: params?.connectorId ?? '',
          connector_info: params?.assignFormValue ?? {},
          agent_type: agentType,
          bot_id: botId,
          space_id,
        },
        { __disableErrorToast: true },
      );
      return res;
    },
  };

  const { run, loading } = useRequest(
    async (params?: StepRunParams) => await SERVICE_MAP[currentAction](params),
    {
      manual: true,
      ready: Object.keys(SERVICE_MAP).includes(String(currentAction)),
      onSuccess: data => {
        const action = currentAction as
          | SchemaAreaPageApi.BindConnector
          | SchemaAreaPageApi.GetBindConnectorConfig;
        onNextStepSuccess?.({ data, action });
      },
      onError: error => {
        onNextStepError(error);
      },
    },
  );

  return {
    run,
    loading,
    step,
    setStep,
  };
};
