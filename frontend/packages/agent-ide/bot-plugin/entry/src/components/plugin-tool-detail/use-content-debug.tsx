/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import { IconCozPlayFill } from '@coze-arch/coze-design/icons';
import { Button, Modal } from '@coze-arch/coze-design';

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
          disabled={false} // Is it debuggable?
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
            disabled={false} // Is it debuggable?
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
