import {
  type Model,
  ModelFuncConfigType,
  ModelFuncConfigStatus,
} from '@coze-arch/bot-api/developer_api';

export type ModelCapabilityConfig = {
  // 方便 multi-agent 场景下识别到底是哪个 model 能力不支持
  [key in ModelFuncConfigType]: [
    configStatus: ModelFuncConfigStatus,
    modelName: string,
  ];
};

export type TGetModelCapabilityConfig = (params: {
  modelIds: string[];
  getModelById: (id: string) => Model | undefined;
}) => ModelCapabilityConfig;

// 模型能力配置的 fallback，没有配置的能力按支持处理
export const defaultModelCapConfig = Object.values(ModelFuncConfigType).reduce(
  (res, type) => ({
    ...res,
    [type]: [
      ModelFuncConfigStatus.FullSupport,
      '',
    ] satisfies ModelCapabilityConfig[ModelFuncConfigType],
  }),
  {},
) as ModelCapabilityConfig;

export const mergeModelFuncConfigStatus = (
  ...values: ModelFuncConfigStatus[]
) => Math.max(...values);

const mergeModelCapabilityConfig = (
  src: ModelCapabilityConfig,
  target: Model['func_config'],
  targetName: string,
) =>
  target
    ? Object.entries(target).reduce<ModelCapabilityConfig>(
        (merged, [key, status]) => {
          // 未配置的能力视为完全支持
          const [preStatus, preName] = merged[
            key as unknown as ModelFuncConfigType
          ] ?? [ModelFuncConfigStatus.FullSupport, []];
          const mergedStatus = mergeModelFuncConfigStatus(preStatus, status);
          return {
            ...merged,
            [key]: [
              mergedStatus,
              mergedStatus === preStatus ? preName : targetName,
            ],
          };
        },
        src,
      )
    : src;

export const getMultiAgentModelCapabilityConfig: TGetModelCapabilityConfig = ({
  getModelById,
  modelIds,
}) =>
  Array.from(modelIds).reduce((res, modelId) => {
    const model = getModelById(modelId);
    if (model?.func_config) {
      return mergeModelCapabilityConfig(
        res,
        model.func_config,
        model.name ?? '',
      );
    }
    return res;
  }, defaultModelCapConfig);

export const getSingleAgentModelCapabilityConfig: TGetModelCapabilityConfig = ({
  getModelById,
  modelIds,
}) => {
  const model = getModelById(modelIds.at(0) ?? '');
  return mergeModelCapabilityConfig(
    defaultModelCapConfig,
    model?.func_config,
    model?.name ?? '',
  );
};
