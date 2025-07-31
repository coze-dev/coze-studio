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

/* eslint-disable @coze-arch/max-line-per-function */
import React, { type FC, useContext } from 'react';

import isNil from 'lodash-es/isNil';
import { unix } from 'dayjs';
import classNames from 'classnames';
import { OrderBy, WorkFlowListStatus } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozClockFill,
  IconCozCheckMarkCircleFill,
} from '@coze-arch/coze-design/icons';
import { Typography, LoadingButton } from '@coze-arch/coze-design';
import { Avatar, Image, Tooltip } from '@coze-arch/bot-semi';
import { CheckType } from '@coze-arch/bot-api/workflow_api';
import { type Int64, SpaceType } from '@coze-arch/bot-api/developer_api';

import { LibButton } from '@/workflow-modal/content/card/lib-button';

import WorkflowModalContext from '../../workflow-modal-context';
import { isSelectProjectCategory } from '../../utils';
import {
  DataSourceType,
  MineActiveEnum,
  type ProductInfo,
  WorkflowCategory,
  type WorkflowInfo,
  WorkflowModalFrom,
} from '../../type';
import {
  useWorkflowAction,
  type WorkflowCardProps,
} from '../../hooks/use-workflow-action';
import { WorkflowParameters } from './parameters';
import { DeleteButton } from './delete-button';
import { WorkflowBotButton } from './bot-button';

import styles from './index.module.less';

const { Text } = Typography;

const formatTime = (time?: Int64) => unix(Number(time)).format('YYYY-MM-DD');

const defaultWorkFlowList = [];

export const WorkflowCard: FC<WorkflowCardProps> = props => {
  const {
    data,
    workFlowList = defaultWorkFlowList,
    from,
    workflowNodes,
    dupText,
    itemShowDelete,
  } = props;
  const context = useContext(WorkflowModalContext);

  const isProfessionalTemplate = (data as ProductInfo)?.meta_info
    ?.is_professional;

  const {
    dupWorkflowTpl,
    addWorkflow,
    removeWorkflow,
    deleteWorkflow,
    itemClick,
  } = useWorkflowAction({ ...props, isProfessionalTemplate });

  if (!context) {
    return null;
  }

  const StatusMap = {
    unpublished: {
      label: I18n.t('workflow_add_status_unpublished'),
      icon: <IconCozClockFill className="coz-fg-dim text-xs" />,
    },
    published: {
      label: I18n.t('workflow_add_status_published'),
      icon: (
        <IconCozCheckMarkCircleFill className="text-xs coz-fg-hglt-green" />
      ),
    },
  };

  const { orderBy, spaceType } = context;
  const {
    creator: creator,
    status,
    isSpaceWorkflow,
    workflowCategory,
  } = context.modalState;
  const isTeam = spaceType === SpaceType.Team;

  function isTypeWorkflow(
    target: WorkflowInfo | ProductInfo,
  ): target is WorkflowInfo {
    return context?.modalState.dataSourceType === DataSourceType.Workflow;
  }

  const pluginId = isTypeWorkflow(data) ? data.plugin_id : '';
  const statusValue =
    !isNil(pluginId) && isSpaceWorkflow
      ? StatusMap[pluginId === '0' ? 'unpublished' : 'published']
      : undefined;

  const renderStatusValue = () => {
    // Add workflow nodes in the project, official examples do not show release status
    if (
      isSelectProjectCategory(context?.modalState) ||
      workflowCategory === WorkflowCategory.Example
    ) {
      return null;
    }
    if (statusValue) {
      return (
        <div className={classNames(styles.status)}>
          {statusValue.icon}
          <span className={styles.text}>{statusValue.label}</span>
        </div>
      );
    }
    return null;
  };
  const renderBottomLeftDesc = () => {
    // bottom of the product
    if (!isTypeWorkflow(data)) {
      const timeRender = `${I18n.t('workflow_add_list_updated')} ${formatTime(
        data.meta_info.listed_at,
      )}`;

      return (
        <div className={styles.info}>
          <div className={styles.creator}>
            <Avatar
              className={styles['creator-avatar']}
              src={data.meta_info.user_info?.avatar_url}
            />
            <Text
              ellipsis={{ showTooltip: true }}
              className={styles['creator-name']}
            >
              {data.meta_info.user_info?.name ??
                I18n.t('workflow_add_list_unknown')}
            </Text>
            <span className={styles.symbol}>|</span>
          </div>
          <span className={styles.date}>{timeRender}</span>

          {(Number(data?.workflow_extra?.duplicate_count) || 0) > 0 ? (
            <>
              <span className={styles.symbol}>|</span>
              <Text className={styles.date}>
                {Number(data?.workflow_extra?.duplicate_count) || 0}{' '}
                {I18n.t('workflowstore_card_duplicate')}
              </Text>
            </>
          ) : null}
        </div>
      );
    }

    // User-created, showing modification time
    if (isSpaceWorkflow || workflowCategory === WorkflowCategory.Example) {
      const showCreator =
        (creator !== MineActiveEnum.Mine && isTeam) ||
        from === WorkflowModalFrom.ProjectImportLibrary;
      const timeRender =
        orderBy === OrderBy.CreateTime
          ? `${I18n.t('workflow_add_list_created')} ${formatTime(
              data.create_time,
            )}`
          : status === WorkFlowListStatus.HadPublished
          ? `${I18n.t('workflow_add_list_publised')} ${formatTime(
              data.update_time,
            )}`
          : `${I18n.t('workflow_add_list_updated')} ${formatTime(
              data.update_time,
            )}`;
      return (
        <div className={styles.info}>
          {showCreator ? (
            <div className={styles.creator}>
              <Avatar
                className={styles['creator-avatar']}
                src={data.creator?.avatar_url}
              />
              <Text
                ellipsis={{ showTooltip: true }}
                className={styles['creator-name']}
              >
                {data.creator?.name ?? I18n.t('workflow_add_list_unknown')}
              </Text>
              <span className={styles.symbol}>|</span>
            </div>
          ) : null}
          <span className={styles.date}>{timeRender}</span>
        </div>
      );
    }

    // Official template, showcasing creators
    if (!isSpaceWorkflow) {
      return (
        <div className={styles.creator}>
          <Image
            preview={false}
            src={data.template_author_picture_url}
            className={styles.avatar}
          />
          <Text ellipsis={{ showTooltip: true }} className={styles.name}>
            {data.template_author_name || '-'}
          </Text>
        </div>
      );
    }
    return null;
  };
  const renderBotButton = () => {
    if (workflowCategory === WorkflowCategory.Example && isTypeWorkflow(data)) {
      const botAgentCheckResult = data?.check_result?.find(
        check => check.type === CheckType.BotAgent,
      );
      const ButtonContent = (
        <LoadingButton
          color="primary"
          data-testid="workflow.modal.add"
          disabled={botAgentCheckResult && !botAgentCheckResult?.is_pass}
          onClick={async e => {
            e.stopPropagation();
            await dupWorkflowTpl();
          }}
        >
          {dupText || I18n.t('workflowstore_duplicate_and_add')}
        </LoadingButton>
      );

      if (
        botAgentCheckResult &&
        !botAgentCheckResult.is_pass &&
        botAgentCheckResult.reason
      ) {
        return (
          <Tooltip content={botAgentCheckResult.reason}>
            {ButtonContent}
          </Tooltip>
        );
      }
      return ButtonContent;
    }

    if (from === WorkflowModalFrom.ProjectImportLibrary) {
      return (
        <LibButton data={data as WorkflowInfo} onImport={props.onImport} />
      );
    }
    return (
      <>
        <WorkflowBotButton
          isAdded={workFlowList.some(
            workflow =>
              workflow.workflow_id === (data as WorkflowInfo)?.workflow_id,
          )}
          workflowNodes={workflowNodes}
          from={from}
          data={data as WorkflowInfo}
          onAdd={() => addWorkflow()}
          onRemove={() => {
            removeWorkflow();
          }}
        />
        {itemShowDelete ? (
          <DeleteButton className="ml-[4px]" onDelete={deleteWorkflow} />
        ) : null}
      </>
    );
  };

  return (
    <div
      className={styles.container}
      onClick={() => {
        itemClick();
      }}
    >
      <div className={styles.left}>
        <div className={styles.icon}>
          <Image
            preview={false}
            src={isTypeWorkflow(data) ? data.url : data.meta_info.icon_url}
          />
        </div>
      </div>
      <div className={styles.center}>
        <div className={styles.header}>
          <div className={styles.title_wrapper}>
            <Text ellipsis={{ showTooltip: true }} className={styles.title}>
              {isTypeWorkflow(data) ? data.name : data.meta_info.name}
            </Text>
            {renderStatusValue()}
          </div>
        </div>
        <div className={styles.content}>
          <Text
            ellipsis={{
              showTooltip: {
                opts: {
                  style: {
                    maxWidth: 600,
                    wordBreak: 'break-word',
                  },
                },
              },
            }}
            className={styles.desc}
          >
            {(isTypeWorkflow(data) ? data.desc : data.meta_info.description) ||
              ''}
          </Text>
        </div>
        <div className={styles.footer}>
          <WorkflowParameters data={data} />
          {renderBottomLeftDesc()}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.buttons}>{renderBotButton()}</div>
      </div>
    </div>
  );
};
