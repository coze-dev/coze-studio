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

import { useState, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import { type PluginAPIInfo } from '@coze-arch/bot-api/plugin_develop';

import { STATUS } from '../plugin_modal/types/modal';
import { Debug } from '../plugin_modal/debug';
import { useDebugFooter } from '../../hooks/example/use-debug-footer';

export enum ExampleScene {
  ViewExample,
  EditExample,
  ReadonlyExample,
}

interface ExampleModalProps {
  visible: boolean;
  onCancel: () => void;
  apiInfo: PluginAPIInfo;
  pluginId: string;
  pluginName: string;
  onSave?: () => void;
}

export const ExampleModal: FC<ExampleModalProps> = ({
  visible,
  onCancel,
  apiInfo,
  pluginId,
  pluginName,
  onSave,
}) => {
  const [dugStatus, setDebugStatus] = useState<STATUS | undefined>(STATUS.FAIL);
  const onNextStep = () => {
    onSave?.();
    setDebugStatus(undefined);
  };
  const cancelHandle = () => {
    onCancel();
    setDebugStatus(undefined);
  };
  const { debugFooterNode, setDebugExample, debugExample } = useDebugFooter({
    apiInfo,
    loading: false,
    dugStatus,
    btnLoading: false,
    nextStep: onNextStep,
  });
  return (
    <UIModal
      title={I18n.t('plugin_edit_tool_edit_example')}
      visible={visible}
      width={1280}
      style={{ height: 'calc(100vh - 140px)', minWidth: '1040px' }}
      centered
      onCancel={cancelHandle}
      footer={<div>{debugFooterNode}</div>}
    >
      {apiInfo ? (
        <Debug
          disabled={false}
          isViewExample={true}
          setDebugStatus={setDebugStatus}
          pluginId={pluginId}
          apiId={apiInfo?.api_id ?? ''}
          apiInfo={apiInfo as PluginAPIInfo}
          pluginName={pluginName}
          setDebugExample={setDebugExample}
          debugExample={debugExample}
        />
      ) : null}
    </UIModal>
  );
};
