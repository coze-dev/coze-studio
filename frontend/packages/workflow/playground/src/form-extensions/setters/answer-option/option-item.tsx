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

import { forwardRef } from 'react';

import classNames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';
import { type SetterOrDecoratorContext } from '@flowgram-adapter/free-layout-editor';
import { IconHandle } from '@douyinfe/semi-icons';

import { ExpressionEditorContainer } from '../expression-editor/container';
import { ValidationErrorWrapper } from '../../components/validation';

import styles from './index.module.less';

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
  setterContext: SetterOrDecoratorContext;
}

export const OptionItem = forwardRef<HTMLDivElement, OptionItemProps>(
  (props, dragRef) => {
    const {
      content,
      canDrag,
      portId,
      readonly = false,
      className,
      index,
      optionName,
      disableDelete,
      onChange,
      onDelete,
      setterContext,
      showOptionName,
      optionPlaceholder,
      optionEnableInterpolation,
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

        <ValidationErrorWrapper path={`${index}`} className="w-full">
          {options => (
            <div className="flex items-center space-x-1 w-full min-h-[24px]">
              {!readonly ? (
                <ExpressionEditorContainer
                  value={content}
                  onChange={val => {
                    onChange?.(val);
                    options.onChange();
                  }}
                  onFocus={() => options.onFocus()}
                  onBlur={() => options.onBlur()}
                  isError={options.showError}
                  context={setterContext}
                  readonly={readonly}
                  minRows={1}
                  placeholder={optionPlaceholder}
                  disableSuggestion={!optionEnableInterpolation}
                  customClassName={classNames(
                    '!rounded-[6px]',
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
                    icon={<IconCozMinus className="text-sm" />}
                  />
                ) : null}
              </div>
            </div>
          )}
        </ValidationErrorWrapper>
      </div>
    );
  },
);
