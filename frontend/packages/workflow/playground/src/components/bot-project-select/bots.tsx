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
import classNames from 'classnames';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { IconSearch } from '@douyinfe/semi-icons';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base/constants';
import { concatTestId } from '@coze-workflow/base';
import {
  IntelligenceStatus,
  IntelligenceType,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Typography, Spin, Avatar, Select } from '@coze-arch/bot-semi';
import { intelligenceApi } from '@coze-arch/bot-api';
import { Tag, Tooltip } from '@coze-arch/coze-design';

import { ChatflowService } from '@/services';

import { useGlobalState, useRelatedBotService } from '../../hooks';
import { isItemDisabled } from './utils';
import { useExtraBotOption } from './use-extra-bot-option';
import type {
  IBotSelectOption,
  IBotSelectOptions,
  ValueType,
  DisableExtraOptions,
} from './types';

import styles from './bots.module.less';

const RenderCustomOption = (
  item: IBotSelectOption | undefined,
  extraOptions: DisableExtraOptions,
) => {
  if (!item) {
    return null;
  }

  const {
    disableBot,
    disableProject,
    disableBotTooltip,
    disableProjectTooltip,
  } = extraOptions;

  const isBot = item.type === IntelligenceType.Bot;
  const disabled = isItemDisabled({ disableBot, disableProject }, item.type);

  const disabledTooltip =
    isBot && disableBot ? disableBotTooltip : disableProjectTooltip;

  const renderOptionItem = optionItem => (
    <div className="flex" style={{ width: '100%', alignItems: 'center' }}>
      <Avatar
        size="extra-extra-small"
        style={{ flexShrink: 0, marginRight: 8 }}
        shape="square"
        src={optionItem.avatar}
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
          {optionItem.name}
        </Typography.Text>
      </div>
      {optionItem.type === IntelligenceType.Project ? (
        <Tag size="mini" color="primary">
          {I18n.t('wf_chatflow_106')}
        </Tag>
      ) : (
        <Tag size="mini" color="primary">
          {I18n.t('wf_chatflow_107')}
        </Tag>
      )}
    </div>
  );

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
      disabled={disabled}
      className={classNames(
        styles['bot-option'],
        disabled ? styles['bot-option-disabled'] : '',
      )}
    >
      {disabled ? (
        <Tooltip content={disabledTooltip} position="left">
          {renderOptionItem(item)}
        </Tooltip>
      ) : (
        renderOptionItem(item)
      )}
    </Select.Option>
  );
};

export const RenderFootLoading = ({
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
  isBot: boolean;
  value?: ValueType;
  onChange?: (value?: ValueType) => void;
}

export const Bots: React.FC<BotsProps & DisableExtraOptions> = ({
  isBot,
  value,
  onChange,
  disableBot = false,
  disableProject = false,
  disableBotTooltip = '',
  disableProjectTooltip = '',
  ...props
}) => {
  const idValue = value?.id;
  const globalState = useGlobalState();
  const DebounceTime = 500;
  const chatflowService = useService<ChatflowService>(ChatflowService);
  const relatedBotService = useRelatedBotService();

  const isLoadMoreDate = useRef(false);
  const [selectList = [], setSelectList] = useState<IBotSelectOptions>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShowFoot, setIsShowFoot] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [searchTotal, setTotal] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextCursorRef = useRef<string | undefined>();

  const useNewGlobalVariableCache = !globalState.isInIDE;

  const handleChange = (botInfo?: IBotSelectOption, _value?: ValueType) => {
    chatflowService.setSelectItem(botInfo);
    onChange?.(_value);
  };

  // Due to paging restrictions, the selected botId may not find the corresponding option and needs to be added
  const extraBotOption = useExtraBotOption(
    selectList,
    idValue,
    isBot,
    handleChange,
  );

  // The total number obtained by the interface is not the real total, and the front end may splice options.
  const listMaxHeight = useMemo(() => {
    const realTotal = extraBotOption ? searchTotal + 1 : searchTotal;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return realTotal < 7 ? realTotal * 32 : 208;
  }, [searchTotal, extraBotOption]);

  useEffect(() => {
    fetchBotList();
  }, []);

  useEffect(() => {
    const findItem = selectList?.find(item => item.value === value?.id);
    const disabled = isItemDisabled(
      { disableBot, disableProject },
      findItem?.type,
    );
    // Clear the selected value when disabled
    if (value && findItem?.type && disabled) {
      onChange?.(undefined);
    }
    if (value?.id !== chatflowService.selectItem?.value) {
      if (!value) {
        chatflowService.setSelectItem(undefined);
        return;
      }
      if (findItem) {
        chatflowService.setSelectItem(findItem);
      }
    }
  }, [value, selectList]);

  const fetchBotList = async (query?: string, isReset = false) => {
    if (query) {
      setIsLoading(true);
    }
    if (isReset) {
      // If it is a re-search, you need to clear the previous cursor
      nextCursorRef.current = undefined;
    }

    // Query the list using the new interface within the project
    const res = await intelligenceApi.GetDraftIntelligenceList({
      space_id:
        globalState.spaceId === PUBLIC_SPACE_ID
          ? globalState.personalSpaceId
          : globalState.spaceId,
      name: query ?? search,
      types: [IntelligenceType.Bot, IntelligenceType.Project],
      size: 30,
      order_by: 0,
      cursor_id: nextCursorRef.current,
      status: [
        IntelligenceStatus.Using,
        IntelligenceStatus.Banned,
        IntelligenceStatus.MoveFailed,
      ],
    });
    const { intelligences, total = 0, next_cursor_id } = res?.data ?? {};

    const list: IBotSelectOptions = (intelligences ?? []).map(it => ({
      name: it.basic_info?.name ?? '',
      value: it.basic_info?.id ?? '',
      avatar: it.basic_info?.icon_url ?? '',
      type: it.type || IntelligenceType.Bot,
    }));
    const totalList = isReset ? list : [...selectList, ...list];

    setTotal(total);
    nextCursorRef.current = next_cursor_id;
    setSelectList(totalList);
    setIsShowFoot(totalList.length < total);
    setIsLoading(false);
  };

  const loadMoreData = async () => {
    if (isLoadMoreDate.current) {
      return;
    }
    isLoadMoreDate.current = true;
    await fetchBotList();
    isLoadMoreDate.current = false;
  };

  const handleSearch = query => {
    setSearch(query);
    fetchBotList(query, true);
  };

  return (
    <div className={styles['select-wrapper']} ref={containerRef}>
      <Select
        value={idValue}
        data-testid={concatTestId(
          'workflow',
          'playground',
          'testerun',
          'bot-select',
        )}
        dropdownClassName={styles.dropdown}
        filter
        remote
        placeholder={I18n.t('wf_chatflow_73')}
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
        onChange={newValue => {
          // Set the selected item type (bot/project)
          const findItem = selectList.find(item => item.value === newValue);

          if (useNewGlobalVariableCache && findItem?.type) {
            relatedBotService.updateRelatedBot({
              id: newValue as string,
              type: findItem?.type === IntelligenceType.Bot ? 'bot' : 'project',
            });
          }

          handleChange(
            findItem,
            findItem
              ? {
                  id: newValue as string,
                  type: findItem.type,
                }
              : undefined,
          );
        }}
        {...props}
      >
        {[extraBotOption, ...selectList]
          .filter(item => item)
          .map(item =>
            RenderCustomOption(item, {
              disableBot,
              disableProject,
              disableBotTooltip,
              disableProjectTooltip,
            }),
          )}

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
