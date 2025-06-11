import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/bot-semi';
import {
  ModelFuncConfigStatus,
  ModelFuncConfigType,
} from '@coze-arch/bot-api/developer_api';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

export const useDatasetAutoChangeConfirm = () => {
  const {
    storeSet: { useModelStore },
  } = useBotEditor();
  return async (auto: boolean, modelId: string) => {
    const model = useModelStore.getState().getModelById(modelId);
    // 提前防御获取不到 model 的情况（火山账号允许迁移后 bot 不带 model 配置）
    if (!model) {
      return true;
    }
    const modelName = model.name;
    const modelConfig = model.func_config;
    const status =
      modelConfig?.[
        auto
          ? ModelFuncConfigType.KnowledgeAutoCall
          : ModelFuncConfigType.KnowledgeOnDemandCall
      ];
    if (
      status === ModelFuncConfigStatus.NotSupport ||
      status === ModelFuncConfigStatus.PoorSupport
    ) {
      const callMethod = auto
        ? I18n.t('dataset_automatic_call')
        : I18n.t('dataset_on_demand_call');
      const toolName = I18n.t('Datasets');
      return new Promise(resolve => {
        const modal = Modal.confirm({
          zIndex: 1031,
          title: I18n.t('confirm_switch_to_on_demand_call', {
            call_method: callMethod,
          }),
          content: {
            [ModelFuncConfigStatus.NotSupport]: I18n.t(
              'switch_to_on_demand_call_warning_notsupported',
              { call_method: callMethod, modelName, toolName },
            ),
            [ModelFuncConfigStatus.PoorSupport]: I18n.t(
              'switch_to_on_demand_call_warning_supportpoor',
              { callMethod, modelName, toolName },
            ),
          }[status],
          onCancel: () => {
            resolve(false);
            modal.destroy();
          },
          onOk: () => {
            resolve(true);
            modal.destroy();
          },
        });
      });
    }
    return true;
  };
};
