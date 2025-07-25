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
 
import { useCallback, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { WorkflowExecStatus } from '@coze-workflow/base';
import { SelectSpaceModal } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { Toast, Tooltip } from '@coze-arch/coze-design';
import { openNewWindow } from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UIButton } from '@coze-arch/bot-semi';
import { IconCopyStroked } from '@douyinfe/semi-icons';

import styles from '../index.module.less';
import { getWorkflowUrl } from '../../../utils/get-workflow-url';
import { useWorkflowOperation, useGlobalState } from '../../../hooks';

interface Props {
  mode: 'icon' | 'button';
}

export const DuplicateButton = ({ mode }: Props) => {
  const {
    isFromExplore,
    isSceneFlow,
    spaceId: spaceID,
    viewStatus,
    isViewHistory,
    isBindDouyin,
    readonly,
  } = useGlobalState();

  const operation = useWorkflowOperation();

  /** 运行时禁用复制 */
  const disabled = viewStatus === WorkflowExecStatus.EXECUTING;

  //  场景工作流readonly时或运行时或浏览历史时隐藏复制
  const visible =
    !(isSceneFlow && readonly) &&
    viewStatus !== WorkflowExecStatus.EXECUTING &&
    !isViewHistory &&
    !isBindDouyin; // 抖音分身模式下不展示复制

  const [loading, setLoading] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);

  const { spaceList } = useSpaceStore(
    useShallow(store => ({
      spaceList: store.spaces.bot_space_list,
    })),
  );

  const getCopyUrl = async (_spaceID?: string) => {
    setLoading(true);
    const resp = await operation.copy();

    if (!resp?.workflow_id) {
      return Toast.error(I18n.t('workflow_detail_toast_createcopy_failed'));
    }

    Toast.success({
      content: I18n.t('workflow_detail_toast_createcopy_succeed'),
      showClose: false,
    });

    setLoading(false);
    return getWorkflowUrl({
      space_id: _spaceID || '',
      workflow_id: resp.workflow_id,
    });
  };

  const handleCopy = (id?: string) => {
    openNewWindow(() => getCopyUrl(id));
  };

  const handleDuplicate = useCallback(() => {
    if (spaceList.length > 1 && isFromExplore) {
      setShowSpaceModal(true);
    } else {
      handleCopy(spaceID);
    }
  }, [spaceList, isFromExplore, spaceID]);

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* 流程运行态下不展示 copy 文案 */}
      {/* ux 优化 - 对齐预览 tag 展示逻辑，非流程 owner copy 按钮展示保持不变 */}
      {mode === 'button' ? (
        <UIButton
          disabled={disabled}
          theme="solid"
          type="primary"
          loading={loading}
          onClick={handleDuplicate}
        >
          {I18n.t('workflow_detail_title_copy')}
        </UIButton>
      ) : null}

      {/* ux 优化 - 对齐预览 tag 展示逻辑，流程 owner copy 按钮展示在最右侧，弱化交互 */}
      {mode === 'icon' ? (
        <Tooltip
          content={I18n.t('workflow_detail_title_copy')}
          position="bottom"
        >
          <UIButton
            className={styles['icon-copy']}
            disabled={disabled}
            loading={loading}
            onClick={handleDuplicate}
            icon={<IconCopyStroked />}
            data-testid="workflow.detail.title.duplicate"
          />
        </Tooltip>
      ) : null}

      {showSpaceModal ? (
        <SelectSpaceModal
          visible={true}
          onCancel={() => {
            setShowSpaceModal(false);
          }}
          onConfirm={id => {
            handleCopy(id);
            setShowSpaceModal(false);
          }}
        />
      ) : null}
    </>
  );
};
