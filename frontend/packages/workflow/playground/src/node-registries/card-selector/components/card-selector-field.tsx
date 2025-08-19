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

import React, { useState, useCallback, useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { AutoComplete, Spin, message } from '@coze-arch/bot-semi';

import { Section, useField, withField } from '@/form';

import type { CardItem } from '../types';
import { fetchCardList } from '../api';

interface CardSelectorCompProps {
  title?: string;
  tooltip?: string;
  sassWorkspaceId?: string;
}

function CardSelectorComp({
  title,
  tooltip,
  sassWorkspaceId = '7533521629687578624', // 默认工作空间ID
}: CardSelectorCompProps) {
  const { value, onChange, readonly, name } = useField<CardItem | undefined>();
  const [loading, setLoading] = useState(false);
  const [cardList, setCardList] = useState<CardItem[]>([]);
  const [searchValue, setSearchValue] = useState('');

  // 获取卡片列表
  const fetchCards = useCallback(
    async (search = '') => {
      if (loading) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetchCardList({
          sassWorkspaceId,
          pageNo: 1,
          pageSize: 200,
          searchValue: search,
        });

        setCardList(response.cardList || []);
      } catch (error) {
        console.error('获取卡片列表出错:', error);
        message.error('获取卡片列表失败，请稍后重试');
        setCardList([]);
      } finally {
        setLoading(false);
      }
    },
    [sassWorkspaceId, loading],
  );

  // 处理搜索
  const handleSearch = useCallback(
    (searchText: string) => {
      setSearchValue(searchText);
      if (searchText.trim()) {
        fetchCards(searchText.trim());
      } else {
        // 如果搜索为空，获取默认列表
        fetchCards();
      }
    },
    [fetchCards],
  );

  // 处理焦点事件，首次加载数据
  const handleFocus = useCallback(() => {
    if (cardList.length === 0 && !loading) {
      fetchCards();
    }
  }, [cardList.length, loading, fetchCards]);

  // 处理选择
  const handleSelect = useCallback(
    (selectedValue: string, option: { value: string; label: string }) => {
      const selectedCard = cardList.find(card => card.cardId === selectedValue);
      if (selectedCard) {
        onChange(selectedCard);
        setSearchValue(`${selectedCard.cardName} (${selectedCard.code})`);
      }
    },
    [cardList, onChange],
  );

  // 处理输入变化
  const handleChange = useCallback(
    (inputValue: string) => {
      setSearchValue(inputValue);
      // 如果清空了输入，清空选择
      if (!inputValue) {
        onChange(undefined);
      }
    },
    [onChange],
  );

  // 生成选项数据
  const options = useMemo(
    () =>
      cardList.map(card => ({
        value: card.cardId,
        label: `${card.cardName} (${card.code})`,
        card,
      })),
    [cardList],
  );

  // 当前显示的值
  const displayValue = useMemo(() => {
    if (value) {
      return `${value.cardName} (${value.code})`;
    }
    return searchValue;
  }, [value, searchValue]);

  return (
    <Section title={title} tooltip={tooltip}>
      <AutoComplete
        name={name}
        value={displayValue}
        onSearch={handleSearch}
        onSelect={handleSelect}
        onChange={handleChange}
        onFocus={handleFocus}
        disabled={readonly}
        placeholder={I18n.t('请输入卡片名称或代码进行搜索')}
        style={{ width: '100%' }}
        dropdownMatchSelectWidth={true}
        maxHeight={300}
        loading={loading}
        suffix={loading ? <Spin size="small" /> : undefined}
        data={options.map(option => ({
          value: option.value,
          label: (
            <div style={{ padding: '4px 0' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {option.card.cardName}
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                代码: {option.card.code}
              </div>
            </div>
          ),
        }))}
        emptyContent={
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            {loading
              ? '加载中...'
              : cardList.length === 0 && searchValue
                ? '未找到匹配的卡片'
                : '请输入关键词搜索卡片'}
          </div>
        }
      />
      {value ? (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#666' }}>已选择卡片:</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {value.cardName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            代码: {value.code}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {value.cardId}
          </div>
        </div>
      ) : null}
    </Section>
  );
}

export const CardSelectorField = withField(CardSelectorComp);
