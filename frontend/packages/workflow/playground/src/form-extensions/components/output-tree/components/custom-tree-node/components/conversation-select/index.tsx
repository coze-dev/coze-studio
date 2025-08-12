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
import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Typography, Select, type SelectProps } from '@coze-arch/coze-design';
import { CreateMethod, CreateEnv } from '@coze-arch/bot-api/workflow_api';
import { IconSearch } from '@douyinfe/semi-icons';

import { useGlobalState } from '@/hooks/use-global-state';

import styles from './index.module.less';

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
export type ConversationSelectProps = {
  enableTypes?: Array<'static' | 'dynamic'>;
  value?: string;
  onChange?: (value: string) => void;
} & Pick<
  SelectProps,
  'size' | 'disabled' | 'className' | 'onBlur' | 'defaultValue'
>;

interface ConversationItem {
  value: string;
  label: string;
  conversationId: string;
}

/**
 * Derived from @/components/conversation-select/conversations.tsx changed the value to conversation_name instead of unique_id
 */
export const ConversationSelect: React.FC<ConversationSelectProps> = ({
  enableTypes = ['static', 'dynamic'],
  // value,
  onChange,
  ...props
}) => {
  const globalState = useGlobalState();
  const DebounceTime = 500;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [staticList, setStaticList] = useState<ConversationItem[]>([]);
  const [dynamicList, setDynamicList] = useState<ConversationItem[]>([]);
  const { projectId = '', spaceId, projectCommitVersion } = globalState;

  // The total number obtained by the interface is not the real total, and the front end may splice options.
  const listMaxHeight = useMemo(() => {
    const realTotal = staticList?.length + dynamicList?.length;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return realTotal < 7 ? realTotal * 32 : 208;
  }, [staticList, dynamicList]);

  useEffect(() => {
    !props.disabled && fetchList();
  }, [projectId, props.disabled]);

  const fetchList = async (query?: string) => {
    setIsLoading(true);

    if (enableTypes.includes('static')) {
      const staticListRes = await workflowApi.ListProjectConversationDef({
        space_id: spaceId,
        project_id: projectId,
        project_version: projectCommitVersion,
        create_method: CreateMethod.ManualCreate,
        create_env: CreateEnv.Draft,
        nameLike: query ?? search,
        limit: MAX_LIMIT,
      });
      setStaticList(
        staticListRes.data?.map(item => ({
          value: item.conversation_name || '',
          label: item.conversation_name || '',
          conversationId: item.conversation_id || '',
        })) || [],
      );
    }
    if (enableTypes.includes('dynamic')) {
      const dynamicListRes = await workflowApi.ListProjectConversationDef({
        space_id: globalState.spaceId || '',
        project_id: projectId,
        project_version: projectCommitVersion,
        create_method: CreateMethod.NodeCreate,
        create_env: CreateEnv.Draft,
        nameLike: query ?? search,
        limit: MAX_LIMIT,
      });
      setDynamicList(
        dynamicListRes.data?.map(item => ({
          value: item.conversation_name || '',
          label: item.conversation_name || '',
          conversationId: item.conversation_id || '',
        })) || [],
      );
    }
    setIsLoading(false);
  };

  const handleSearch = query => {
    setSearch(query);
    fetchList(query);
  };

  return (
    <Select
      // value={value}
      dropdownClassName={styles.dropdown}
      filter
      remote
      placeholder={I18n.t('wf_chatflow_114')}
      emptyContent={I18n.t('wf_chatflow_115')}
      onSearch={debounce(handleSearch, DebounceTime)}
      prefix={<IconSearch />}
      loading={isLoading}
      style={{ width: '100%' }}
      virtualize={{
        height: listMaxHeight,
        width: '100%',
        itemSize: 32,
      }}
      onChange={newValue => {
        const findItem = [...staticList, ...dynamicList].find(
          item => item.value === newValue,
        );
        onChange?.(findItem?.value as string);
      }}
      {...props}
    >
      <Select.OptGroup
        key={Number(new Date())}
        label={I18n.t('wf_chatflow_103')}
      >
        {staticList.map(item => RenderCustomOption(item))}
      </Select.OptGroup>
      <Select.OptGroup
        key={Number(new Date())}
        label={I18n.t('wf_chatflow_43')}
      >
        {dynamicList.map(item => RenderCustomOption(item))}
      </Select.OptGroup>
    </Select>
  );
};
