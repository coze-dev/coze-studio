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

import update from 'immutability-helper';
import classNames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { withValidation } from '../../components/validation';
import { useUpdateSortedPortLines } from '../../../hooks/use-update-sorted-port-lines';
import { SortableList } from '../../../components/sortable-list';
import { convertNumberToLetters, calcPortId } from './utils';
import { OptionItem } from './option-item';

export interface AnswerOptionProps {
  /** Whether to display the title line */
  showTitleRow?: boolean;

  /** Whether to display option labels */
  showOptionName?: boolean;

  /** Option placeholder */
  optionPlaceholder?: string;

  /** Default branch name */
  defaultOptionText?: string;

  /** Option whether to allow interpolation */
  optionEnableInterpolation?: boolean;

  /** Option maximum quantity limit, default value is integer maximum */
  maxItems?: number;

  /** New button style */
  addButtonClassName?: string;

  /** Display Forbid Add Tooltip */
  showDisableAddTooltip?: boolean;
  customDisabledAddTooltip?: string;
}

export const AnswerOption = withValidation<
  SetterComponentProps & AnswerOptionProps
>(props => {
  const { value, onChange, context, readonly, options } = props;
  const {
    showTitleRow = true,
    showOptionName = true,
    optionPlaceholder = '',
    defaultOptionText,
    optionEnableInterpolation,
    maxItems = Number.MAX_SAFE_INTEGER,
    addButtonClassName = '',
    showDisableAddTooltip = true,
    customDisabledAddTooltip,
  } = options;

  const { getNodeSetterId } = useNodeTestId();

  const handleChange = val => {
    onChange(val);
  };

  const updateSortedPortLines = useUpdateSortedPortLines(calcPortId);

  const onItemDelete = (index: number) => {
    // Move the port to be deleted to the end so that the deletion does not affect other connection sequences
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
      // Solve the problem that onClick does not trigger due to Button displacement
      onMouseDown={() => {
        handleChange([...value, { name: '' }]);
      }}
      icon={<IconCozPlus className="text-sm" />}
    />
  );

  return (
    <div
      className={classNames({
        [options?.customClassName]: options?.customClassName,
      })}
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
              setterContext={context}
              showOptionName={showOptionName}
              optionPlaceholder={optionPlaceholder}
              optionEnableInterpolation={optionEnableInterpolation}
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
        setterContext={context}
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

export const answerOption = {
  key: 'answer-option',
  component: AnswerOption,
};
