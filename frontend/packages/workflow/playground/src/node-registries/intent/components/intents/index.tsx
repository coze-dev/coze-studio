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
 
import React from 'react';

import { isNil } from 'lodash-es';
import update from 'immutability-helper';
import classNames from 'classnames';
import {
  MINIMAL_INTENT_ITEMS,
  STANDARD_INTENT_ITEMS,
  INTENT_NODE_MODE,
} from '@coze-workflow/nodes';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import {
  INTENT_MODE,
  INTENTS,
  QUICK_INTENTS,
} from '@/node-registries/intent/constants';
import { useUpdateSortedPortLines } from '@/hooks';
import {
  calcPortId,
  convertNumberToLetters,
} from '@/form-extensions/setters/answer-option/utils';
import { useField, withField, Section, useWatch } from '@/form';
import { SortableList } from '@/components/sortable-list';

import { type IntentsType } from '../../types';
import { OptionItem } from './option-item';

interface Props {
  /** 是否展示标题行 */
  showTitleRow?: boolean;

  /** 是否展示选项标签 */
  showOptionName?: boolean;

  /** 选项 placeholder */
  optionPlaceholder?: string;

  /** 默认分支名称 */
  defaultOptionText?: string;

  /** 选项是否允许插值 */
  optionEnableInterpolation?: boolean;

  /** 选项最大数量限制，默认值为整数最大值 */
  maxItems?: number;

  /** 新增按钮样式 */
  addButtonClassName?: string;

  /** 展示禁止添加 Tooltip */
  showDisableAddTooltip?: boolean;
  customDisabledAddTooltip?: string;
  customClassName?: string;
}

const IntentsField = withField((props: Props) => {
  const { value, onChange, readonly, name } = useField<IntentsType>();

  const {
    showTitleRow = true,
    showOptionName = true,
    optionPlaceholder = '',
    defaultOptionText = '',
    optionEnableInterpolation,
    maxItems = Number.MAX_SAFE_INTEGER,
    addButtonClassName = '',
    showDisableAddTooltip = true,
    customDisabledAddTooltip,
    customClassName,
  } = props;

  const { getNodeSetterId } = useNodeTestId();

  const handleChange = val => {
    onChange(val);
  };

  const updateSortedPortLines = useUpdateSortedPortLines(calcPortId);

  const onItemDelete = (index: number) => {
    // 将要被删除的端口移动到最后，这样删除时不会对其他连线顺序产生影响
    updateSortedPortLines(index, value.length);

    const newVal = update(value, { $splice: [[index, 1]] });
    handleChange(newVal);
  };

  const onItemChange = (val: string, index: number) => {
    const newVal = update(value, {
      [index]: {
        name: { $set: val },
      },
    });

    handleChange(newVal);
  };

  const AddActionButton = (
    <IconButton
      className={classNames('absolute right-3 top-3', {
        [addButtonClassName]: addButtonClassName,
      })}
      color="highlight"
      size="small"
      disabled={readonly || value.length >= maxItems}
      data-testid={getNodeSetterId('answer-option-add-btn')}
      // 解决 Button 位移导致 onClick 不触发问题
      onMouseDown={() => {
        handleChange([...value, { name: '' }]);
      }}
      icon={<IconCozPlus className="text-sm" />}
    />
  );

  return (
    <div
      className={
        !isNil(customClassName)
          ? classNames({
              [customClassName]: customClassName,
            })
          : undefined
      }
    >
      {showTitleRow ? (
        <div className="flex items-center text-xs text-[#1D1C23] opacity-60 h-7">
          <div className={'ml-1 w-[71px]'}>
            {I18n.t('workflow_ques_ans_type_option_title', {}, 'options')}
          </div>
          <div className={'ml-6'}>
            {I18n.t('workflow_ques_ans_type_option_content', {}, 'content')}
          </div>
        </div>
      ) : null}

      <SortableList
        value={value}
        onChange={handleChange}
        onDragEnd={updateSortedPortLines}
        renderItem={(item, index, dragOption) => {
          const { dragRef, isPreview } = dragOption || {};

          return (
            <OptionItem
              name={`${name}.${index}`}
              testIdPath={`/${name}`}
              ref={dragRef}
              index={index}
              content={item.name}
              onChange={val => onItemChange(val, index)}
              portId={isPreview ? undefined : calcPortId(index)}
              optionName={convertNumberToLetters(index)}
              onDelete={!isPreview ? () => onItemDelete(index) : undefined}
              disableDelete={value.length <= 1}
              canDrag
              readonly={readonly}
              showOptionName={showOptionName}
              optionPlaceholder={optionPlaceholder}
              optionEnableInterpolation={optionEnableInterpolation}
              isField
            />
          );
        }}
      />
      <OptionItem
        className="mt-2"
        content={defaultOptionText}
        optionName={I18n.t('workflow_ques_ans_type_option_other', {}, 'other')}
        portId="default"
        readonly
        showOptionName={showOptionName}
        optionPlaceholder={optionPlaceholder}
      />

      <div className="mt-2 answer-option-add-button">
        {showDisableAddTooltip && value.length >= maxItems ? (
          <Tooltip
            content={
              customDisabledAddTooltip ||
              I18n.t('workflow_250117_05', { maxCount: maxItems })
            }
          >
            <div className="absolute right-3 top-3 background w-[24px] h-[24px] coz-mg-hglt coz-fg-hglt-dim p-[5px] rounded-[5px] flex items-center cursor-not-allowed">
              <IconCozPlus className="text-sm" />
            </div>
          </Tooltip>
        ) : (
          AddActionButton
        )}
      </div>
    </div>
  );
});

export const Intents = () => {
  const intentMode = useWatch({ name: INTENT_MODE });
  const isShow = intentMode === INTENT_NODE_MODE.STANDARD;
  const { getNodeSetterId } = useNodeTestId();

  return (
    isShow && (
      <Section
        title={I18n.t('workflow_intent_matchlist_title')}
        tooltip={I18n.t('workflow_intent_matchlist_tooltips')}
        testId={getNodeSetterId(`/${INTENTS}`)}
      >
        <IntentsField
          name={INTENTS}
          showTitleRow={false}
          showOptionName={false}
          optionPlaceholder={I18n.t('workflow_intent_matchlist_placeholder')}
          defaultOptionText={I18n.t('workflow_intent_matchlist_else')}
          optionEnableInterpolation={false}
          maxItems={STANDARD_INTENT_ITEMS}
          customDisabledAddTooltip={I18n.t('workflow_250117_02')}
          hasFeedback={false}
        />
      </Section>
    )
  );
};

export const QuickIntents = () => {
  const intentMode = useWatch({ name: INTENT_MODE });
  const isShow = intentMode === INTENT_NODE_MODE.MINIMAL;
  const { getNodeSetterId } = useNodeTestId();
  return (
    isShow && (
      <Section
        testId={getNodeSetterId(`/${QUICK_INTENTS}`)}
        title={I18n.t('workflow_intent_matchlist_title')}
        tooltip={I18n.t('workflow_intent_matchlist_tooltips')}
      >
        <IntentsField
          name={QUICK_INTENTS}
          showTitleRow={false}
          showOptionName={false}
          optionPlaceholder={I18n.t('workflow_intent_matchlist_placeholder')}
          defaultOptionText={I18n.t('workflow_intent_matchlist_else')}
          optionEnableInterpolation={false}
          maxItems={MINIMAL_INTENT_ITEMS}
          customDisabledAddTooltip={I18n.t('workflow_250117_01')}
          hasFeedback={false}
        />
      </Section>
    )
  );
};
