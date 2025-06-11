import React, { type FC } from 'react';

import classNames from 'classnames';
import { BindBizType, WorkflowMode } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { UICompositionModal } from '@coze-arch/bot-semi';

import {
  DataSourceType,
  MineActiveEnum,
  WorkFlowModalModeProps,
  WorkflowModalFrom,
  WorkflowModalState,
  type WorkflowModalProps,
  WORKFLOW_LIST_STATUS_ALL,
  BotPluginWorkFlowItem,
} from './type';
import { useWorkflowModalParts } from './hooks/use-workflow-modal-parts';
import {
  WORKFLOW_MODAL_I18N_KEY_MAP,
  ModalI18nKey,
} from './hooks/use-i18n-text';

import styles from './index.module.less';
export { ModalI18nKey };

const WorkflowModal: FC<WorkflowModalProps> = ({
  className,
  visible,
  onClose,
  ...props
}) => {
  const { sider, filter, content } = useWorkflowModalParts(props);
  const flowMode = props.flowMode ?? WorkflowMode.Workflow;
  const isDouyinBot = props.bindBizType === BindBizType.DouYinBot;

  return (
    <UICompositionModal
      visible={visible}
      onCancel={onClose}
      siderWrapperClassName={props.hideSider || isDouyinBot ? 'hidden' : ''}
      header={I18n.t(
        WORKFLOW_MODAL_I18N_KEY_MAP[flowMode]?.[ModalI18nKey.Title],
      )}
      className={classNames(
        styles['workflow-modal'],
        className,
        'new-workflow-modal',
        isDouyinBot ? styles['douyin-workflow-modal'] : '',
      )}
      sider={sider}
      filter={filter}
      content={content}
    />
  );
};

export default WorkflowModal;

export {
  useWorkflowModalParts,
  DataSourceType,
  MineActiveEnum,
  WorkflowModalFrom,
  WorkflowModalProps,
  WorkFlowModalModeProps,
  WorkflowModalState,
  WORKFLOW_LIST_STATUS_ALL,
  BotPluginWorkFlowItem,
};

export { isSelectProjectCategory } from './utils';
export { WorkflowCategory } from './type';
