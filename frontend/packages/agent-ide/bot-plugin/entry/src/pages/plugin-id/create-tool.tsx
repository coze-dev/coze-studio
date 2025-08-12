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

import { useShallow } from 'zustand/react/shallow';
import { isBoolean } from 'lodash-es';
import {
  usePluginNavigate,
  usePluginStore,
} from '@coze-studio/bot-plugin-store';
import { Modal } from '@coze-arch/bot-semi';
import { useBaseInfo } from '@coze-agent-ide/bot-plugin-tools/useBaseInfo';
import { STARTNODE } from '@coze-agent-ide/bot-plugin-tools/pluginModal/config';
import { Button } from '@coze-arch/coze-design';

import { SecurityCheckFailed } from '@/components/check_failed';

interface UseCreateToolProps {
  text: string;
  space_id?: string;
  plugin_id: string;
  onClickWrapper?: (fn: () => void) => () => Promise<void>;
  /**
   * The callback function before clicking the Create Tool button
   * @Returns {boolean | void} returns false to block subsequent actions
   */
  onBeforeClick?: () => void;
  disabled: boolean;
  isShowBtn?: boolean;
}

interface CreateToolProps extends UseCreateToolProps {
  todo?: string;
}

export const useCreateTool = ({
  text,
  plugin_id,
  onClickWrapper,
  onBeforeClick,
  disabled,
  isShowBtn = true,
  space_id,
}: UseCreateToolProps) => {
  const resourceNavigate = usePluginNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showSecurityCheckFailedMsg, setShowSecurityCheckFailedMsg] =
    useState(false);
  const { pluginInfo, unlockPlugin, setPluginInfo } = usePluginStore(
    useShallow(store => ({
      pluginInfo: store.pluginInfo,
      unlockPlugin: store.unlockPlugin,
      setPluginInfo: store.setPluginInfo,
    })),
  );
  const { baseInfoNode, submitBaseInfo } = useBaseInfo({
    pluginId: plugin_id || '',
    setApiId: (apiId: string) => {
      setIsSubmit(false);
      resourceNavigate.tool?.(apiId, { toStep: '1' }, { replace: true });
    },
    showModal: false,
    disabled,
    showSecurityCheckFailedMsg,
    setShowSecurityCheckFailedMsg,
    editVersion: pluginInfo?.edit_version,
    space_id: space_id || '',
    pluginType: pluginInfo?.plugin_type,
    showFunctionName: true,
    onSuccess: baseResData => {
      setPluginInfo({
        ...pluginInfo,
        edit_version: baseResData?.edit_version,
      });
    },
  });
  const handleShow = () => {
    const res = onBeforeClick?.();
    if (isBoolean(res) && !res) {
      return;
    }
    setVisible(true);
    setBtnLoading(false);
  };
  const handleLoading = (fn: () => void) => () => {
    setBtnLoading(true);
    fn();
  };
  return {
    content: (
      <>
        {isShowBtn ? (
          <Button
            disabled={disabled}
            loading={btnLoading}
            color="primary"
            onClick={handleLoading(
              onClickWrapper ? onClickWrapper(handleShow) : handleShow,
            )}
          >
            {text}
          </Button>
        ) : null}
        <Modal
          title={text}
          loading={isSubmit}
          visible={visible}
          onOk={async () => {
            setIsSubmit(true);
            await submitBaseInfo();
            unlockPlugin();
            setIsSubmit(false);
          }}
          onCancel={() => {
            unlockPlugin();
            setVisible(false);
          }}
          closeOnEsc={true}
        >
          {baseInfoNode}
          {showSecurityCheckFailedMsg ? (
            <SecurityCheckFailed step={STARTNODE} />
          ) : null}
        </Modal>
      </>
    ),
    openModal: () => {
      onClickWrapper ? onClickWrapper(handleShow)() : handleShow();
    },
    closeModal: () => {
      unlockPlugin();
      setVisible(false);
    },
  };
};

/**
 * @description creation tool
 */
export const CreateTool: FC<CreateToolProps> = props => {
  const { content } = useCreateTool({
    ...props,
  });

  return <>{content}</>;
};
