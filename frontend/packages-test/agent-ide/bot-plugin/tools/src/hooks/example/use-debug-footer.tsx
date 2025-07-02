import { useEffect, useState } from 'react';

import { useRequest } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { Space, UIButton, UIToast } from '@coze-arch/bot-semi';
import {
  type DebugExample,
  type PluginAPIInfo,
  DebugExampleStatus,
  type UpdateAPIRequest,
  PluginType,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { usePluginStore } from '@coze-studio/bot-plugin-store';

import { STATUS } from '../../components/plugin_modal/types';
import { ExampleCheckbox } from '../../components/example-checkbox';

interface DebugFooterProps {
  btnLoading: boolean;
  apiInfo: PluginAPIInfo | undefined;
  dugStatus: STATUS | undefined;
  loading: boolean;
  nextStep: () => void;
  previousStep?: () => void;
  editVersion?: number;
  isModal?: boolean;
}

export const useDebugFooter = ({
  btnLoading,
  apiInfo,
  dugStatus,
  loading,
  nextStep,
  editVersion,
}: DebugFooterProps) => {
  const [saveExample, setSaveExample] = useState(
    apiInfo?.debug_example_status === DebugExampleStatus.Enable,
  );
  const [debugExample, setDebugExample] = useState<DebugExample>();
  const { loading: saveLoading, runAsync: runSaveExample } = useRequest(
    (info: UpdateAPIRequest) => PluginDevelopApi.UpdateAPI(info),
    {
      manual: true,
    },
  );
  const { pluginInfo } = usePluginStore(store => ({
    pluginInfo: store.pluginInfo,
  }));

  const onSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await runSaveExample({
      plugin_id: pluginInfo?.plugin_id ?? '',
      api_id: apiInfo?.api_id ?? '',
      edit_version: editVersion ?? pluginInfo?.edit_version,
      save_example: saveExample,
      debug_example: debugExample,
    });
    UIToast.success(I18n.t('Save_success'));
    nextStep();
  };

  useEffect(() => {
    setSaveExample(apiInfo?.debug_example_status === DebugExampleStatus.Enable);
    setDebugExample(
      apiInfo?.debug_example_status === DebugExampleStatus.Enable
        ? apiInfo?.debug_example
        : undefined,
    );
  }, [apiInfo]);

  return {
    debugFooterNode: (
      <Space spacing={12}>
        <ExampleCheckbox value={saveExample} onValueChange={setSaveExample} />
        <UIButton
          disabled={
            loading ||
            (dugStatus !== STATUS.PASS &&
              pluginInfo?.plugin_type !== PluginType.LOCAL)
          }
          style={{ minWidth: 98, margin: 0 }}
          loading={btnLoading || saveLoading}
          type="primary"
          theme="solid"
          onClick={onSave}
        >
          {I18n.t('Create_newtool_s4_done')}
        </UIButton>
      </Space>
    ),
    debugExample,
    setDebugExample,
  };
};
