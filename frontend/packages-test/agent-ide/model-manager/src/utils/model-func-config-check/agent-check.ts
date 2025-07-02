import { type Agent } from '@coze-studio/bot-detail-store';
import { type Dataset, FormatType } from '@coze-arch/bot-api/knowledge';
import {
  type Model,
  ModelFuncConfigStatus,
  ModelFuncConfigType,
  RecognitionMode,
} from '@coze-arch/bot-api/developer_api';

interface AgentModelFuncConfigCheckContext {
  // agent 中的 dataset 可能缺少元信息，需要获取完整数据的方法
  getDatasetById: (id: string) => Dataset | undefined;
  config: Model['func_config'];
}

type GetAgentHasValidDataByFuncConfigType = (
  agent: Agent,
  context: AgentModelFuncConfigCheckContext,
) => boolean;

const getAgentHasValidDataMethodMap: {
  [key in ModelFuncConfigType]?: GetAgentHasValidDataByFuncConfigType;
} = {
  [ModelFuncConfigType.KnowledgeText]: (agent, { getDatasetById }) =>
    !!agent.skills.knowledge.dataSetList?.some(
      item =>
        (getDatasetById(item.dataset_id ?? '') ?? item).format_type ===
        FormatType.Text,
    ),
  [ModelFuncConfigType.KnowledgeTable]: (agent, { getDatasetById }) =>
    !!agent.skills.knowledge.dataSetList?.some(
      item =>
        (getDatasetById(item.dataset_id ?? '') ?? item).format_type ===
        FormatType.Table,
    ),
  [ModelFuncConfigType.KnowledgePhoto]: (agent, { getDatasetById }) =>
    !!agent.skills.knowledge.dataSetList?.some(
      item =>
        (getDatasetById(item.dataset_id ?? '') ?? item).format_type ===
        FormatType.Image,
    ),
  [ModelFuncConfigType.KnowledgeAutoCall]: agent =>
    !!agent.skills.knowledge.dataSetInfo.auto,
  [ModelFuncConfigType.KnowledgeOnDemandCall]: agent =>
    !agent.skills.knowledge.dataSetInfo.auto,
  [ModelFuncConfigType.Plugin]: agent => agent.skills.pluginApis.length > 0,
  [ModelFuncConfigType.Workflow]: agent => agent.skills.workflows.length > 0,
  [ModelFuncConfigType.MultiAgentRecognize]: agent =>
    agent.jump_config.recognition === RecognitionMode.FunctionCall,
};

export const agentModelFuncConfigCheck = ({
  config,
  agent,
  context,
}: {
  config: Model['func_config'];
  agent: Agent;
  context: AgentModelFuncConfigCheckContext;
}) => {
  if (!config) {
    return { poorSupported: [], notSupported: [] };
  }
  const poorSupported: ModelFuncConfigType[] = [];
  const notSupported: ModelFuncConfigType[] = [];
  Object.entries(config).forEach(([type, status]) => {
    const hasValidData = getAgentHasValidDataMethodMap[
      type as unknown as ModelFuncConfigType
    ]?.(agent, context);
    if (hasValidData) {
      if (status === ModelFuncConfigStatus.NotSupport) {
        notSupported.push(type as unknown as ModelFuncConfigType);
      }
      if (status === ModelFuncConfigStatus.PoorSupport) {
        poorSupported.push(type as unknown as ModelFuncConfigType);
      }
    }
  });

  return { poorSupported, notSupported };
};
