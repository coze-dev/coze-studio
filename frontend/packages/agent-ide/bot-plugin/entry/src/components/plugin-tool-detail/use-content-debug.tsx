import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  type GetPluginInfoResponse,
  type PluginAPIInfo,
} from '@coze-arch/bot-api/plugin_develop';
import { usePluginNavigate } from '@coze-studio/bot-plugin-store';
import { type STATUS } from '@coze-agent-ide/bot-plugin-tools/pluginModal/types';
import { Debug } from '@coze-agent-ide/bot-plugin-tools/pluginModal/debug';
import { useDebugFooter } from '@coze-agent-ide/bot-plugin-tools/example/useDebugFooter';
import { IconCozPlayFill } from '@coze/coze-design/icons';
import { Button, Modal } from '@coze/coze-design';

interface UseContentDebugProps {
  debugApiInfo?: PluginAPIInfo;
  pluginInfo?: GetPluginInfoResponse & { plugin_id?: string };
  canEdit: boolean;
  space_id: string;
  plugin_id: string;
  tool_id: string;
  unlockPlugin: () => void;
  editVersion?: number;
  onDebugSuccessCallback?: () => void;
}

export const useContentDebug = ({
  debugApiInfo,
  canEdit,
  plugin_id,
  tool_id,
  unlockPlugin,
  editVersion,
  pluginInfo,
  onDebugSuccessCallback,
}: UseContentDebugProps) => {
  const resourceNavigate = usePluginNavigate();

  const [dugStatus, setDebugStatus] = useState<STATUS | undefined>();
  const [visible, setVisible] = useState(false);
  const [loading] = useState<boolean>(false);

  const { debugFooterNode, setDebugExample, debugExample } = useDebugFooter({
    apiInfo: debugApiInfo,
    loading,
    dugStatus,
    btnLoading: false,
    nextStep: () => {
      resourceNavigate.toResource?.('plugin', plugin_id);

      unlockPlugin();
    },
    editVersion,
  });

  return {
    itemKey: 'tool_debug',
    header: I18n.t('Create_newtool_s4_debug'),
    extra: <>{canEdit ? debugFooterNode : null}</>,
    content:
      debugApiInfo && tool_id ? (
        <Debug
          pluginType={pluginInfo?.plugin_type}
          disabled={false} // 是否可调试
          setDebugStatus={setDebugStatus}
          pluginId={String(plugin_id)}
          apiId={String(tool_id)}
          apiInfo={debugApiInfo as PluginAPIInfo}
          pluginName={String(pluginInfo?.meta_info?.name)}
          setDebugExample={setDebugExample}
          debugExample={debugExample}
        />
      ) : (
        <></>
      ),
    modalContent: (
      <>
        {debugApiInfo && tool_id ? (
          <Button
            onClick={() => {
              setVisible(true);
            }}
            icon={<IconCozPlayFill />}
            color="highlight"
          >
            {I18n.t('project_plugin_testrun')}
          </Button>
        ) : null}
        <Modal
          title={I18n.t('project_plugin_testrun')}
          width={1000}
          visible={visible}
          onOk={() => setVisible(false)}
          onCancel={() => setVisible(false)}
          closeOnEsc={true}
          footer={debugFooterNode}
        >
          <Debug
            pluginType={pluginInfo?.plugin_type}
            disabled={false} // 是否可调试
            setDebugStatus={setDebugStatus}
            pluginId={String(plugin_id)}
            apiId={String(tool_id)}
            apiInfo={debugApiInfo as PluginAPIInfo}
            pluginName={String(pluginInfo?.meta_info?.name)}
            setDebugExample={setDebugExample}
            debugExample={debugExample}
            onSuccessCallback={onDebugSuccessCallback}
          />
        </Modal>
      </>
    ),
  };
};
