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

import { type FC, useContext, useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { UISelect } from '@coze-arch/bot-semi';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import { SpaceType } from '@coze-arch/bot-api/playground_api';

import WorkflowModalContext from '../workflow-modal-context';
import { isSelectProjectCategory } from '../utils';
import {
  DataSourceType,
  MineActiveEnum,
  WORKFLOW_LIST_STATUS_ALL,
  type WorkFlowModalModeProps,
  type WorkflowModalState,
  WorkflowCategory,
} from '../type';
import { CreateWorkflowBtn } from '../sider/create-workflow-btn';
import { useI18nText } from '../hooks/use-i18n-text';
import { statusOptions } from '../constants';
import { SortTypeSelect } from './sort-type-select';

import styles from './index.module.less';

const getStatusOptions = (showAll?: boolean) =>
  showAll
    ? statusOptions
    : statusOptions.filter(item => item.value !== WORKFLOW_LIST_STATUS_ALL);
const flowModeOptions = [
  {
    label: I18n.t('filter_all'),
    value: WorkflowMode.All,
  },
  {
    label: I18n.t('library_resource_type_workflow'),
    value: WorkflowMode.Workflow,
  },
  {
    label: I18n.t('wf_chatflow_76'),
    value: WorkflowMode.ChatFlow,
  },
].filter(item => {
  // The open-source version does not currently support conversation streaming
  if (item.value === WorkflowMode.ChatFlow && IS_OPEN_SOURCE) {
    return false;
  }
  return true;
});
const WorkflowModalFilter: FC<WorkFlowModalModeProps> = props => {
  const context = useContext(WorkflowModalContext);
  const { i18nText, ModalI18nKey } = useI18nText();
  const scopeOptions = useMemo(() => {
    if (!context) {
      return [];
    }
    return [
      {
        label: i18nText(ModalI18nKey.TabAll),
        value: MineActiveEnum.All,
      },
      {
        label: i18nText(ModalI18nKey.TabMine),
        value: MineActiveEnum.Mine,
      },
    ];
  }, []);

  if (!context) {
    return null;
  }

  const { spaceType, updateModalState, modalState } = context;
  const {
    dataSourceType,
    isSpaceWorkflow,
    status,
    creator,
    listFlowMode,
    workflowCategory,
  } = context.modalState;
  const {
    hideSider,
    hiddenCreate,
    filterOptionShowAll = false,
    hideCreatorSelect = false,
    hiddenListFlowModeFilter = false,
  } = props;

  const isExampleWorkflow = workflowCategory === WorkflowCategory.Example;
  const isAddProjectWorkflow = isSelectProjectCategory(modalState);
  return (
    <div
      className={`${styles.header} ${
        hideSider ? 'w-full justify-between' : ''
      }`}
    >
      {(isSpaceWorkflow || isExampleWorkflow) &&
      dataSourceType === DataSourceType.Workflow ? (
        <>
          {!hiddenListFlowModeFilter ? (
            <UISelect
              label={I18n.t('Type')}
              showClear={false}
              value={listFlowMode}
              optionList={flowModeOptions}
              onChange={value => {
                updateModalState({
                  listFlowMode: value as WorkflowMode,
                });
              }}
            />
          ) : null}
          {isAddProjectWorkflow || isExampleWorkflow ? null : (
            <UISelect
              label={I18n.t('publish_list_header_status')}
              showClear={false}
              value={status}
              optionList={getStatusOptions(filterOptionShowAll)}
              onChange={value => {
                updateModalState({
                  status: value as WorkflowModalState['status'],
                });
              }}
            />
          )}

          {spaceType === SpaceType.Team &&
            !hideCreatorSelect &&
            !isExampleWorkflow && (
              <UISelect
                label={I18n.t('Creator')}
                showClear={false}
                value={creator}
                onChange={value => {
                  updateModalState({ creator: value as MineActiveEnum });
                }}
                optionList={scopeOptions}
              />
            )}
        </>
      ) : null}
      {hideSider ? (
        <div className="flex items-center mr-[-24px]">
          {!hiddenCreate && (
            <CreateWorkflowBtn
              className="ml-12px"
              onCreateSuccess={props.onCreateSuccess}
              nameValidators={props.nameValidators}
            />
          )}
        </div>
      ) : null}
      {dataSourceType === DataSourceType.Product ? <SortTypeSelect /> : null}
    </div>
  );
};

export { WorkflowModalFilter };
