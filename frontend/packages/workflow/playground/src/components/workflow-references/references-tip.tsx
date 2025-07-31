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

/**
 * Display the information that the current workflow is referenced by other workflows in the upper left corner of the header
 */

import React, { type FC, useState } from 'react';

import { isEmpty } from 'lodash-es';
import { type Workflow } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { Tag } from '@coze-arch/coze-design';
import { UIButton, List, Popover } from '@coze-arch/bot-semi';
import { IconSmallTriangleDown, IconClose } from '@douyinfe/semi-icons';

import { getWorkflowHeaderTestId } from '../workflow-header/utils';
import { getWorkflowUrl } from '../../utils/get-workflow-url';
import { useWorkflowReferences } from '../..//hooks/use-workflow-references';

import styles from './references-tip.module.less';

interface WorkflowReferences {
  workflowList?: Workflow[];
}

const ReferencingList: FC<
  WorkflowReferences & {
    onClose: () => void;
  }
> = props => {
  const { workflowList, onClose } = props;
  const MAX_RECENT_WORKFLOWS = 30;
  return (
    <div className={styles.workflowReferencingListWrapper}>
      <IconClose
        onClick={onClose}
        className={styles.close}
        data-testid={getWorkflowHeaderTestId('referencing', 'close')}
      />
      <div className={styles.workflowReferencingListTitle}>
        {I18n.t('workflow_detail_node_workflows_referencing', {
          number: workflowList?.length,
        })}
      </div>
      <div className={styles.workflowReferencingListDesc}>
        {I18n.t('workflow_detail_node_workflows_referencing_tip', {
          number: workflowList?.length,
        })}
      </div>
      <List className={styles.workflowReferencingList}>
        {workflowList?.slice(0, MAX_RECENT_WORKFLOWS)?.map(workflow => (
          <List.Item
            key={workflow.workflow_id}
            className={styles.workflowReferencingListItem}
            data-testid={getWorkflowHeaderTestId(
              'referencing',
              'subworkflow',
              workflow.workflow_id ?? '',
            )}
          >
            <img className={styles.icon} src={workflow.url} height={32} />
            <div className={styles.name}>{workflow.name}</div>
            <UIButton
              className={styles.btn}
              type="secondary"
              data-testid={getWorkflowHeaderTestId(
                'referencing',
                'subworkflow',
                workflow.workflow_id ?? '',
                'viewdetail',
              )}
              onClick={() => {
                const referencesUrl = getWorkflowUrl({
                  space_id: workflow.space_id ?? '',
                  workflow_id: workflow.workflow_id ?? '',
                });
                window.open(referencesUrl, '_blank');
              }}
            >
              {I18n.t('binding_view_card')}
            </UIButton>
          </List.Item>
        ))}
      </List>
      {!!workflowList && workflowList.length >= MAX_RECENT_WORKFLOWS && (
        <div className={styles.footer}>
          {I18n.t('workflow_detail_node_workflows_max', {
            number: MAX_RECENT_WORKFLOWS,
          })}
        </div>
      )}
    </div>
  );
};

export const WorkflowReferencesTip = () => {
  const [visible, setVisible] = useState(false);

  const { references } = useWorkflowReferences();

  const toggleVisible = () => setVisible(!visible);

  const closePopover = () => setVisible(false);

  const handleClose = () => closePopover();

  const handleClickTag = () => toggleVisible();

  const handleClickOutSide = () => closePopover();

  if (isEmpty(references?.workflowList)) {
    return null;
  }

  return (
    <Popover
      position="bottomLeft"
      trigger="custom"
      content={<ReferencingList {...references} onClose={handleClose} />}
      visible={visible}
      onClickOutSide={handleClickOutSide}
    >
      <Tag
        onClick={handleClickTag}
        data-testid={getWorkflowHeaderTestId('reference', 'tag')}
        suffixIcon={<IconSmallTriangleDown />}
        size="mini"
        color="primary"
      >
        {I18n.t('workflow_detail_node_workflows_referencing', {
          number: references?.workflowList?.length,
        })}
      </Tag>
    </Popover>
  );
};
