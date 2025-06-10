import { type FC, useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { useModelStore } from '@coze-studio/bot-detail-store/model';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

import { ModelForm } from '../model-form';
import { useHandleModelForm } from '../../hooks/model-form/use-handle-model-form';

import styles from './index.module.less';

export const SingleAgentModelForm: FC<{
  onBeforeSwitchModel?: (modelId: string) => Promise<boolean>;
}> = ({ onBeforeSwitchModel }) => {
  const { model, setModelByImmer } = useModelStore(
    useShallow(state => ({
      model: state,
      setModelByImmer: state.setModelByImmer,
    })),
  );
  const { storeSet } = useBotEditor();
  const modelStore = storeSet.useModelStore(
    useShallow(state => ({
      onlineModelList: state.onlineModelList,
      offlineModelMap: state.offlineModelMap,
      getModelPreset: state.getModelPreset,
    })),
  );
  const isReadonly = useBotDetailIsReadonly();

  const [modelId, setModelId] = useState(model.config.model ?? '');
  const { getSchema, handleFormInit, handleFormUnmount } = useHandleModelForm({
    currentModelId: modelId,
    editable: !isReadonly,
    getModelRecord: () => model.config,
    onValuesChange: ({ values }) => {
      setModelByImmer(draft => {
        draft.config = {
          model: modelId,
          ...values,
        };
      });
    },
    modelStore,
  });

  const schema = useMemo(
    () =>
      getSchema({
        currentModelId: modelId,
        isSingleAgent: true,
      }),
    [modelId],
  );

  return (
    <div
      className={styles['form-wrapper']}
      data-testid="bot.ide.bot_creator.model_config_form"
    >
      <div className={styles['form-title']}>{I18n.t('model_config_title')}</div>
      <ModelForm
        schema={schema}
        currentModelId={modelId}
        onModelChange={async newId => {
          const res = onBeforeSwitchModel
            ? await onBeforeSwitchModel(newId)
            : true;
          if (res) {
            setModelId(newId);
          }
        }}
        onFormInit={handleFormInit}
        onFormUnmount={handleFormUnmount}
      />
    </div>
  );
};
