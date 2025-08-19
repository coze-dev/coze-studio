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

import { type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { AutoComplete, Spin, message } from '@coze-arch/bot-semi';
import type {
  CardParam,
  CardDetail,
} from '@coze-arch/api-schema/idl/workflow/workflow';

import { Section, useField, withField, useForm } from '@/form';

import type { CardItem } from '../types';
import { INPUT_PATH, ANSWER_CONTENT_PATH } from '../constants';
import { fetchCardList, fetchCardDetail } from '../api';

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
  const form = useForm();

  // 参数类型映射：从卡片参数类型映射到InputValueVO类型
  const INPUT_TYPE_STRING = 1;
  const INPUT_TYPE_INTEGER = 2;
  const INPUT_TYPE_BOOLEAN = 3;
  const INPUT_TYPE_ARRAY = 5;
  const INPUT_TYPE_OBJECT = 6;

  const mapParamTypeToInputType = (paramType: string) => {
    switch (paramType.toLowerCase()) {
      case 'string':
        return INPUT_TYPE_STRING;
      case 'number':
      case 'integer':
        return INPUT_TYPE_INTEGER;
      case 'boolean':
        return INPUT_TYPE_BOOLEAN;
      case 'array':
        return INPUT_TYPE_ARRAY;
      case 'object':
        return INPUT_TYPE_OBJECT;
      default:
        return INPUT_TYPE_STRING; // 默认为String
    }
  };

  // 将卡片参数转换为InputValueVO结构
  const convertParamsToInputValues = useCallback(
    (paramList: CardParam[]): InputValueVO[] => {
      const REQUIREMENT_CAN_CHANGE = 3;
      return paramList.map(param => ({
        key: [param.paramName],
        desc: param.desc || '',
        type: mapParamTypeToInputType(param.paramType),
        required: param.required,
        value: '',
        requirement: REQUIREMENT_CAN_CHANGE,
        subParameters: param.children
          ? param.children.map((child: CardParam) => ({
              key: [child.paramName],
              desc: child.desc || '',
              type: mapParamTypeToInputType(child.paramType),
              required: child.required,
              value: '',
              requirement: REQUIREMENT_CAN_CHANGE,
              subParameters: [],
            }))
          : [],
      }));
    },
    [],
  );

  // 生成输出模板
  const generateAnswerContent = useCallback(
    (cardDetail: CardDetail): string => {
      const dataResponse: Record<string, string> = {};

      // 从paramList中提取参数名
      if (cardDetail.paramList) {
        cardDetail.paramList.forEach((param: CardParam) => {
          dataResponse[param.paramName] = `{{${param.paramName}}}`;
        });
      }

      const template = {
        contentList: [
          {
            displayResponseType: 'TEMPLATE',
            rawContent: {},
            templateId: cardDetail.code,
            templateName: cardDetail.cardName,
            kvMap: {},
            dataResponse,
          },
        ],
      };

      const JSON_INDENT = 2;
      return JSON.stringify(template, null, JSON_INDENT);
    },
    [],
  );

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
    async (selectedValue: string) => {
      const selectedCard = cardList.find(card => card.cardId === selectedValue);
      if (selectedCard) {
        onChange(selectedCard);
        setSearchValue(`${selectedCard.cardName} (${selectedCard.code})`);

        try {
          // 获取卡片详情
          const { cardDetail } = await fetchCardDetail({
            cardId: selectedCard.cardId,
            sassWorkspaceId,
          });

          // 如果有参数列表，自动生成输入变量
          if (cardDetail.paramList && cardDetail.paramList.length > 0) {
            const inputParameters = convertParamsToInputValues(
              cardDetail.paramList,
            );
            form.setFieldValue(INPUT_PATH, inputParameters);

            // 自动生成输出模板
            const answerContent = generateAnswerContent(cardDetail);
            form.setFieldValue(ANSWER_CONTENT_PATH, answerContent);

            message.success('已根据卡片自动生成输入变量和输出模板');
          }
        } catch (error) {
          console.error('获取卡片详情失败:', error);
          message.error('获取卡片详情失败，请稍后重试');
        }
      }
    },
    [
      cardList,
      onChange,
      sassWorkspaceId,
      form,
      fetchCardDetail,
      convertParamsToInputValues,
      generateAnswerContent,
    ],
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
