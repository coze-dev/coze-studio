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

import React, { useEffect, useState, useRef, useMemo } from 'react';

import { debounce } from 'lodash-es';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base/constants';
import { concatTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Typography, Spin, Avatar, Select } from '@coze-arch/bot-semi';
import {
  ListBotDraftType,
  PublishStatus,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';
import { IconSearch } from '@douyinfe/semi-icons';

import { useGlobalState } from '../../hooks';
import { useExtraBotOption } from './use-extra-bot-option';
import type { IBotSelectOption } from './types';

import styles from './bots.module.less';

type IBotSelectOptions = IBotSelectOption[];

const RenderCustomOption = item => {
  if (!item) {
    return null;
  }
  return (
    <Select.Option
      data-testid={concatTestId(
        'workflow',
        'playground',
        'testrun',
        'bot-select',
        'option',
        item.value,
      )}
      value={item.value}
      showTick={true}
      key={item.value}
      className={styles['bot-option']}
    >
      <div className="flex" style={{ width: '100%' }}>
        <Avatar
          size="extra-extra-small"
          style={{ flexShrink: 0, marginRight: 8 }}
          shape="square"
          src={item.avatar}
        />
        <div className="flex" style={{ flexGrow: 1, flexShrink: 1, width: 0 }}>
          <Typography.Text
            ellipsis={{ showTooltip: true }}
            style={{
              fontSize: 12,
              color: '#1D1C23',
              fontWeight: 400,
            }}
          >
            {item.name}
          </Typography.Text>
        </div>
      </div>
    </Select.Option>
  );
};

const RenderFootLoading = ({
  onObserver,
}: {
  onObserver: () => Promise<void>;
}) => {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const callback = entries => {
      if (entries[0].isIntersecting) {
        onObserver?.();
      }
    };
    const loadingObserver = new IntersectionObserver(callback);
    indicatorRef.current && loadingObserver.observe(indicatorRef.current);
    return () => loadingObserver.disconnect();
  }, []);
  return (
    <div className={styles['loading-tag']} ref={indicatorRef}>
      <Spin style={{ marginRight: 10 }} size="small" />
      <span>{I18n.t('workflow_add_common_loading')}</span>
    </div>
  );
};

interface BotsProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const Bots: React.FC<BotsProps> = ({ value, onChange, ...props }) => {
  const globalState = useGlobalState();
  const DebounceTime = 500;

  const isLoadMoreDate = useRef(false);
  const [selectList = [], setSelectList] = useState<IBotSelectOptions>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShowFoot, setIsShowFoot] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [searchTotal, setTotal] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Due to paging restrictions, the selected botId may not find the corresponding option and needs to be added
  const extraBotOption = useExtraBotOption(selectList, value);

  // The total number obtained by the interface is not the real total, and the front end may splice options.
  const listMaxHeight = useMemo(() => {
    const realTotal = extraBotOption ? searchTotal + 1 : searchTotal;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return realTotal < 7 ? realTotal * 32 : 208;
  }, [searchTotal, extraBotOption]);

  useEffect(() => {
    fetchBotList();
  }, []);

  const fetchBotList = async (
    index?: number,
    query?: string,
    isReset = false,
  ) => {
    if (query) {
      setIsLoading(true);
    }

    const res = await DeveloperApi.GetDraftBotList({
      space_id:
        globalState.spaceId === PUBLIC_SPACE_ID
          ? globalState.personalSpaceId
          : globalState.spaceId,
      bot_name: query ?? search,
      order_by: 0,
      team_bot_type: ListBotDraftType.TeamBots,
      page_index: index ?? pageIndex,
      page_size: 30,
      is_publish: PublishStatus.All,
    });
    const { bot_draft_list, total = 0 } = res?.data ?? {};
    const list: IBotSelectOptions = (bot_draft_list ?? []).map(it => ({
      name: it.name ?? '',
      value: it.id ?? '',
      avatar: it.icon_url ?? '',
    }));
    const totalList = isReset ? list : [...selectList, ...list];

    setTotal(total);
    setSelectList(totalList);
    setIsShowFoot(totalList.length < total);
    setIsLoading(false);
  };

  const loadMoreData = async () => {
    if (isLoadMoreDate.current) {
      return;
    }
    isLoadMoreDate.current = true;
    const newPageIndex = pageIndex + 1;
    setPageIndex(newPageIndex);
    await fetchBotList(newPageIndex);
    isLoadMoreDate.current = false;
  };

  const handleSearch = query => {
    setSearch(query);
    setPageIndex(1);
    fetchBotList(1, query, true);
  };

  return (
    <div className={styles['select-wrapper']} ref={containerRef}>
      <Select
        value={value}
        data-testid={concatTestId(
          'workflow',
          'playground',
          'testerun',
          'bot-select',
        )}
        dropdownClassName={styles.dropdown}
        showClear
        filter
        remote
        placeholder={I18n.t('workflow_detail_testrun_variable_node_select')}
        emptyContent={I18n.t('agentflow_addbot_select_empty_no_bot')}
        onSearch={debounce(handleSearch, DebounceTime)}
        prefix={<IconSearch />}
        loading={isLoading}
        style={{ width: '100%' }}
        virtualize={{
          height: listMaxHeight,
          width: '100%',
          itemSize: 32,
        }}
        onChange={newValue => onChange?.(newValue as string)}
        {...props}
      >
        {[extraBotOption, ...selectList]
          .filter(item => item)
          .map(item => RenderCustomOption(item))}

        {isShowFoot ? (
          <Select.Option
            value={new Date().getTime()}
            key={new Date().getTime()}
            className={styles['bot-foot-loading']}
            disabled
          >
            <RenderFootLoading onObserver={loadMoreData} />
          </Select.Option>
        ) : null}
      </Select>
    </div>
  );
};
