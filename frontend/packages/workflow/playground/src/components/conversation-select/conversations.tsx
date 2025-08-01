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

import React, { useEffect, useState, useMemo } from 'react';

import { debounce } from 'lodash-es';
import { CONVERSATION_NAME, workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Typography, Select } from '@coze-arch/coze-design';
import { CreateMethod, CreateEnv } from '@coze-arch/bot-api/workflow_api';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { ChatflowService } from '@/services';

import {
  useGetStartNode,
  useGetStartNodeOutputs,
} from '../test-run/hooks/use-get-start-node';
import { type ValueType } from '../bot-project-select/types';
import { useGlobalState } from '../../hooks';

import styles from './bots.module.less';

const MAX_LIMIT = 1000;

const RenderCustomOption = item => {
  if (!item) {
    return null;
  }
  return (
    <Select.Option
      value={item.value}
      showTick={true}
      key={item.value}
      className={styles['bot-option']}
    >
      <div className="flex" style={{ width: '100%' }}>
        <div className="flex" style={{ flexGrow: 1, flexShrink: 1, width: 0 }}>
          <Typography.Text
            ellipsis={{ showTooltip: true }}
            style={{
              fontSize: 12,
              color: '#1D1C23',
              fontWeight: 400,
            }}
          >
            {item.label}
          </Typography.Text>
        </div>
      </div>
    </Select.Option>
  );
};
interface ConversationsProps {
  enableTypes?: 'static' | 'dynamic'[];
  value?: string;
  onChange?: (value: string) => void;
  projectId?: string | ValueType;
}

interface ConversationItem {
  value: string;
  label: string;
  conversationId: string;
}

export const Conversations: React.FC<ConversationsProps> = ({
  enableTypes = ['static', 'dynamic'],
  value,
  onChange,
  projectId: propsProjectId,
  ...props
}) => {
  const globalState = useGlobalState();
  const { getNode } = useGetStartNode();
  const startNode = getNode();

  const DebounceTime = 500;
  const chatflowService = useService<ChatflowService>(ChatflowService);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [staticList, setStaticList] = useState<
    ConversationItem[] | undefined
  >();
  const [dynamicList, setDynamicList] = useState<
    ConversationItem[] | undefined
  >();
  const [fetchingProjectId, setFetchingProjectId] = useState('');
  const projectId =
    (propsProjectId as ValueType)?.id ||
    (propsProjectId as string) ||
    globalState.projectId ||
    '';

  // The total number obtained by the interface is not the real total, and the front end may splice options.
  const listMaxHeight = useMemo(() => {
    const realTotal = (staticList?.length || 0) + (dynamicList?.length || 0);
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return realTotal < 7 ? realTotal * 32 : 208;
  }, [staticList, dynamicList]);

  const handleChange = (newValue: string, findItem?: ConversationItem) => {
    if (findItem) {
      chatflowService.setSelectConversationItem(findItem);
    }
    onChange?.(newValue);
  };
  const { getStartNodeOutputs } = useGetStartNodeOutputs();

  const initFn = async () => {
    const list = await fetchList();
    // Get the data from the start node to set the initial value
    if (startNode && !value) {
      const outputs = getStartNodeOutputs();
      const defaultName =
        outputs.find(output => output.name === CONVERSATION_NAME)
          ?.defaultValue || '';
      const findItem = list.find(item => item.label === defaultName);
      // The conversation_name of the start node is selected by default, if not, Default default session is selected by default
      handleChange(findItem?.value || '0', findItem);
    }
  };

  useEffect(() => {
    if (projectId) {
      initFn();
    }
  }, [projectId]);

  useEffect(() => {
    // Lock to ensure that the current list content is consistent with the incoming projectId, and then search for the corresponding item from the list
    // Initialize any list without getting ready for follow-up logic
    if (fetchingProjectId !== projectId || !staticList || !dynamicList) {
      return;
    }
    const findItem = [...staticList, ...dynamicList].find(
      item => item.value === value,
    );
    if (
      value &&
      findItem?.value !== chatflowService.selectConversationItem?.value
    ) {
      chatflowService.setSelectConversationItem(findItem);
      handleChange(findItem?.value || '0');
    }
  }, [value, staticList, dynamicList]);

  const fetchList = async (query?: string) => {
    setIsLoading(true);
    let staticRes: ConversationItem[] = [];
    let dynamicRes: ConversationItem[] = [];
    setFetchingProjectId(projectId);

    if (enableTypes.includes('static')) {
      const staticListRes = await workflowApi.ListProjectConversationDef({
        space_id: globalState.spaceId,
        project_id: projectId,
        project_version: globalState.projectCommitVersion,
        create_method: CreateMethod.ManualCreate,
        create_env: CreateEnv.Draft,
        nameLike: query ?? search,
        limit: MAX_LIMIT,
      });
      staticRes =
        staticListRes.data?.map(item => ({
          value: item.unique_id || '',
          label: item.conversation_name || '',
          conversationId: item.conversation_id || '',
        })) || [];
      setStaticList(staticRes);
    }
    if (enableTypes.includes('dynamic')) {
      const dynamicListRes = await workflowApi.ListProjectConversationDef({
        space_id: globalState.spaceId || '',
        project_id: projectId,
        project_version: globalState.projectCommitVersion,
        create_method: CreateMethod.NodeCreate,
        create_env: CreateEnv.Draft,
        nameLike: query ?? search,
        limit: MAX_LIMIT,
      });
      dynamicRes =
        dynamicListRes.data?.map(item => ({
          value: item.unique_id || '',
          label: item.conversation_name || '',
          conversationId: item.conversation_id || '',
        })) || [];
      setDynamicList(dynamicRes);
    }
    setIsLoading(false);
    return [...staticRes, ...dynamicRes];
  };

  const handleSearch = query => {
    setSearch(query);
    fetchList(query);
  };

  return (
    <Select
      value={value}
      dropdownClassName={styles.dropdown}
      filter
      remote
      placeholder={I18n.t('wf_chatflow_114')}
      emptyContent={I18n.t('wf_chatflow_115')}
      onSearch={debounce(handleSearch, DebounceTime)}
      loading={isLoading}
      style={{ width: '100%' }}
      virtualize={{
        height: listMaxHeight,
        width: '100%',
        itemSize: 32,
      }}
      onChange={newValue => {
        const findItem = [...(staticList || []), ...(dynamicList || [])].find(
          item => item.value === newValue,
        );
        handleChange(newValue as string, findItem);
      }}
      {...props}
    >
      <Select.OptGroup
        key={Number(new Date())}
        label={I18n.t('wf_chatflow_103')}
      >
        {(staticList || []).map(item => RenderCustomOption(item))}
      </Select.OptGroup>
      <Select.OptGroup
        key={Number(new Date())}
        label={I18n.t('wf_chatflow_43')}
      >
        {(dynamicList || []).map(item => RenderCustomOption(item))}
      </Select.OptGroup>
    </Select>
  );
};
