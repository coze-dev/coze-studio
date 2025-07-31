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

import React, { forwardRef } from 'react';

import classNames from 'classnames';
import { type FieldError } from '@flowgram-adapter/free-layout-editor';
import { IconHandle } from '@douyinfe/semi-icons';
import { useNodeTestId } from '@coze-workflow/base';
import { IconCozMinusCircle } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import { ExpressionEditor } from '@/nodes-v2/components/expression-editor';
import { useField, withField } from '@/form';

import styles from '../index.module.less';

export interface OptionItemProps {
  index?: number;
  optionName: string;
  content: string;
  portId?: string;
  canDrag?: boolean;
  readonly?: boolean;
  className?: string;
  disableDelete?: boolean;
  showOptionName?: boolean;
  optionPlaceholder?: string;
  optionEnableInterpolation?: boolean;
  onChange?: (val: string) => void;
  onDelete?: () => void;
  errors?: FieldError[];
  name?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  isField?: boolean;
  testIdPath?: string;
}

const Item = (props: OptionItemProps) => {
  const {
    content,
    portId,
    readonly = false,
    disableDelete,
    onChange,
    onDelete,
    optionPlaceholder,
    optionEnableInterpolation,
    errors,
    onFocus,
    onBlur,
    testIdPath,
    name = '',
  } = props;

  const { getNodeSetterId, concatTestId } = useNodeTestId();

  return (
    <div className="w-full">
      <div className="flex items-center space-x-1 w-full min-h-[24px]">
        {!readonly ? (
          <ExpressionEditor
            name={name}
            testId={testIdPath}
            value={content}
            onChange={val => {
              onChange?.(val);
            }}
            onFocus={() => onFocus?.()}
            onBlur={() => onBlur?.()}
            isError={errors && errors?.length > 0}
            readonly={readonly}
            minRows={1}
            placeholder={optionPlaceholder}
            disableSuggestion={!optionEnableInterpolation}
            className="!p-[4px]"
            containerClassName={classNames(
              '!rounded-[6px]',
              styles['option-expression-editor'],
              !optionEnableInterpolation
                ? styles['expression-editor-no-interpolation']
                : '',
            )}
          />
        ) : (
          <div className="w-full">{content}</div>
        )}

        <div>
          {onDelete && !readonly ? (
            <IconButton
              size="small"
              color="secondary"
              data-testid={concatTestId(
                getNodeSetterId('answer-option-item-delete'),
                portId || '',
              )}
              className={classNames('flex', {
                'cursor-pointer': !disableDelete,
                'cursor-not-allowed': disableDelete,
                'text-[--semi-color-tertiary-active]': disableDelete,
              })}
              onClick={() => {
                if (disableDelete) {
                  return;
                }
                onDelete();
              }}
              icon={<IconCozMinusCircle className="text-sm" />}
            />
          ) : null}
        </div>
      </div>

      <FormItemFeedback errors={errors} />
    </div>
  );
};

const ItemField = withField((props: OptionItemProps) => {
  const { onBlur, onFocus, errors } = useField();

  return <Item {...props} errors={errors} onFocus={onFocus} onBlur={onBlur} />;
});

export const OptionItem = forwardRef<HTMLDivElement, OptionItemProps>(
  (props, dragRef) => {
    const {
      canDrag,
      portId,
      readonly = false,
      className,
      optionName,
      showOptionName,
      isField,
      name,
    } = props;

    const { getNodeSetterId, concatTestId } = useNodeTestId();

    return (
      <div
        className={classNames('flex items-start space-x-1 text-xs', className)}
      >
        <div className="flex w-4 min-w-4 shrink-0 mt-[4px]">
          {canDrag ? (
            <IconHandle
              data-testid={concatTestId(
                getNodeSetterId('answer-option-item-handle'),
                portId || '',
              )}
              data-disable-node-drag="true"
              className={classNames({
                'cursor-move': !readonly,
                'pointer-events-none': readonly,
              })}
              ref={dragRef}
              style={{ color: '#aaa' }}
            />
          ) : null}
        </div>
        {showOptionName ? (
          <div className="break-keep min-w-[75px] mt-[5px]">{optionName}</div>
        ) : null}

        {isField && name ? (
          <ItemField {...props} name={name} hasFeedback={false} />
        ) : (
          <Item {...props} />
        )}
      </div>
    );
  },
);
