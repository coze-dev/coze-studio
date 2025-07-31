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

import React, { type FC, useState } from 'react';

import cs from 'classnames';
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import {
  Typography,
  Toast,
  Popover,
  UIButton,
  Tooltip,
} from '@coze-arch/bot-semi';
import {
  IconAdd,
  IconInfo,
  IconPluginsSelected,
  IconWorkflowsSelected,
} from '@coze-arch/bot-icons';
import {
  type PluginApi,
  type PluginParameter,
  ToolType,
} from '@coze-arch/bot-api/developer_api';

import style from '../../index.module.less';
import ActionButton from '../../components/action-button';
import {
  OpenModeType,
  type SkillsModalProps,
  type ToolInfo,
} from '../../../types';
import { validatePluginAndWorkflowParams } from '../../../../utils/tool-params';
import CloseToolIcon from '../../../../assets/close-tool.svg';
import { getSkillModalTab, initToolInfoByToolApi } from './method';

import styles from './index.module.less';

interface ToolActionProps {
  initTool?: ToolInfo;
  skillModal: FC<SkillsModalProps>;
  onSelect?: (tooInfo: ToolInfo | null) => void;
  isBanned: boolean;
}

const ToolButton = (props: {
  toolInfo: ToolInfo;
  onCancel: () => void;
  isBanned: boolean;
}) => {
  const {
    toolInfo: { tool_type, tool_name },
    onCancel,
    isBanned,
  } = props;
  const [removePopoverVisible, setRemovePopoverVisible] = useState(false);
  const removePopoverContent = (
    <div className={style['remove-popover-content']}>
      <Typography.Text className={style.title}>
        {I18n.t('shortcut_modal_remove_plugin_wf_double_confirm')}
      </Typography.Text>
      <Typography.Text className={style.desc}>
        {I18n.t('shortcut_modal_remove_plugin_wf_double_tip')}
      </Typography.Text>
      <UIButton className={style['delete-btn']} onClick={() => onCancel()}>
        {I18n.t('shortcut_modal_remove_plugin_wf_button')}
      </UIButton>
    </div>
  );

  return (
    <Popover
      trigger="custom"
      position="bottomRight"
      content={removePopoverContent}
      onClickOutSide={() => setRemovePopoverVisible(false)}
      visible={removePopoverVisible}
    >
      <div
        className={cs(
          'flex ml-2 rounded-[6px] coz-mg-primary items-center px-[10px] py-[3px] text-xs coz-fg-primary',
        )}
      >
        {tool_type === ToolType.ToolTypePlugin && (
          <IconPluginsSelected className={styles.icon} />
        )}
        {tool_type === ToolType.ToolTypeWorkFlow && (
          <IconWorkflowsSelected className={styles.icon} />
        )}

        <Typography.Text
          ellipsis={{
            showTooltip: {
              opts: { content: tool_name },
            },
          }}
          size="small"
        >
          {tool_name}
        </Typography.Text>
        {isBanned ? (
          <Tooltip content={I18n.t('Plugin_delisted')}>
            <IconInfo className="ml-1" />
          </Tooltip>
        ) : null}
        <img
          className="ml-[8px] cursor-pointer"
          alt="close"
          src={CloseToolIcon}
          onClick={() => {
            setRemovePopoverVisible(true);
          }}
        />
      </div>
    </Popover>
  );
};

export const useToolAction = (props: ToolActionProps) => {
  const { skillModal: SkillModal, onSelect, initTool, isBanned } = props;
  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolInfo | null>(
    initTool || null,
  );
  const onToolChange = (toolApi: WorkFlowItemType | PluginApi | undefined) => {
    const tooInfo = initToolInfoByToolApi(toolApi);
    const { tool_params_list } = tooInfo || {};
    if (!checkParams(tool_params_list ?? [])) {
      return;
    }
    onSelect?.(tooInfo);
    setSelectedTool(tooInfo);
    setSkillModalVisible(false);
  };
  const checkParams = (parameters: Array<PluginParameter>) => {
    const { isSuccess, inValidType } = validatePluginAndWorkflowParams(
      parameters ?? [],
      true,
    );

    if (isSuccess) {
      return true;
    }

    if (inValidType === 'empty') {
      Toast.error(I18n.t('shortcut_modal_add_plugin_wf_no_input_error'));
    } else {
      Toast.error(I18n.t('shortcut_modal_add_plugin_wf_complex_input_error'));
    }
    return false;
  };

  const open = () => {
    onSelect?.(null);
    setSkillModalVisible(true);
  };
  const cancel = () => {
    onSelect?.(null);
    setSelectedTool(null);
  };

  const action = (
    <div className="mr-2 mt-[-2px]">
      {selectedTool?.tool_type ? (
        <ToolButton
          toolInfo={selectedTool}
          onCancel={cancel}
          isBanned={isBanned}
        />
      ) : (
        <ActionButton icon={<IconAdd />} onClick={open}>
          {I18n.t('shortcut_modal_use_tool_select_button')}
        </ActionButton>
      )}
      {skillModalVisible ? (
        <SkillModal
          tabs={getSkillModalTab()}
          onCancel={() => setSkillModalVisible(false)}
          openMode={OpenModeType.OnlyOnceAdd}
          openModeCallback={onToolChange}
        />
      ) : null}
    </div>
  );

  return {
    action,
    open,
    cancel,
  };
};
