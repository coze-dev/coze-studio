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

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { every, some } from 'lodash-es';
import { useRequest } from 'ahooks';
import { type PublishConnectorInfo } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { FormSelect, useFormApi } from '@coze-arch/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import { IconCozArrowDown } from '@coze-arch/bot-icons';
import { workflowApi } from '@coze-arch/bot-api';
import { useParams } from 'react-router-dom';

import { useProjectPublishStore } from '@/store';

interface ApiBindProps {
  checked: boolean;
  record: PublishConnectorInfo;
}

export const ApiBind = (props: ApiBindProps) => {
  const { checked, record } = props;
  const { id } = record;
  const { space_id = '', project_id = '' } = useParams<DynamicParams>();
  const formApi = useFormApi();
  const { connectorPublishConfig, setProjectPublishInfo } =
    useProjectPublishStore(
      useShallow(state => ({
        connectorPublishConfig: state.connectorPublishConfig,
        setProjectPublishInfo: state.setProjectPublishInfo,
      })),
    );

  const { data: workflowOptions = [], loading: workflowOptionsLoading } =
    useRequest(async () => {
      const { data } = await workflowApi.GetWorkFlowList({
        project_id,
        space_id,
        page: 1,
        size: 50,
      });
      return (
        data.workflow_list?.map(item => ({
          label: item.name ?? '',
          value: item.workflow_id ?? '',
        })) ?? []
      );
    });

  useEffect(() => {
    // Check if there is a workflow once during initialization.
    if (checked && !workflowOptionsLoading) {
      formApi.validate(['api_workflow']);
    }
  }, [workflowOptionsLoading]);

  const checkWorkflowExist = (val: OptionProps[]) =>
    every(val, (item: OptionProps) => {
      if ('value' in item) {
        return some(
          workflowOptions,
          (optionItem: OptionProps) => optionItem.value === item.value,
        );
      }
      return true;
    });

  const validate = (val: OptionProps[]) => {
    if (checked) {
      const workflowExist = checkWorkflowExist(val);
      if (!workflowExist) {
        return I18n.t('project_release_chatflow3');
      }
      if (!val?.length) {
        return I18n.t('project_release_select_chatflow');
      }
      return '';
    }
    return '';
  };

  return (
    <div>
      <FormSelect
        field="api_workflow"
        optionList={workflowOptions}
        onChangeWithObject
        arrowIcon={<IconCozArrowDown />}
        initValue={
          connectorPublishConfig[id]?.selected_workflows?.map(i => ({
            label: i.workflow_name,
            value: i.workflow_id,
          })) ?? []
        }
        className={`w-[172px] mr-2 ${!checked ? 'hidden' : ''}`}
        noLabel
        placeholder={I18n.t('project_release_select_chatflow')}
        multiple
        validate={validate}
        showClear
        trigger={['custom', 'change']}
        noErrorMessage={!checked}
        onChange={(value: unknown) => {
          setProjectPublishInfo({
            connectorPublishConfig: {
              ...connectorPublishConfig,
              [id]: {
                selected_workflows: (value as OptionProps[])?.map(i => ({
                  workflow_id: i.value?.toString(),
                  workflow_name: i.label?.toString(),
                })),
              },
            },
          });
        }}
        maxTagCount={2}
        ellipsisTrigger
        showRestTagsPopover={true}
        restTagsPopoverProps={{ position: 'top' }}
      />
    </div>
  );
};
