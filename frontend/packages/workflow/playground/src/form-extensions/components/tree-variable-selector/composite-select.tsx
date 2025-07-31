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

import React, {
  type FC,
  useState,
  type ReactNode,
  useRef,
  useCallback,
} from 'react';

import classnames from 'classnames';
import { IconCozArrowDown } from '@coze-arch/coze-design/icons';
import { Popover, Input } from '@coze-arch/coze-design';
import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { type ValidateStatus } from '@coze-arch/bot-semi/Input';
import { IconClear } from '@douyinfe/semi-icons';

import { ValueDisplay } from './value-display';
import { type ITreeNodeData } from './types';
import { useTreeVariableSelectorContext } from './context';
import CompositeSelectTreePanel from './composite-select-tree-panel';

import styles from './composite-select.module.less';

interface CompositeSelectProps {
  id?: string;
  value?: string[];
  treeData?: ITreeNodeData[];
  onChange?: (value?: ITreeNodeData) => void;
  onBlur?: (e: React.MouseEvent) => void;
  invalidContent?: string;
  placeholder?: string;
  emptyContent?: ReactNode;
  disabled?: boolean;
  readonly?: boolean;
  validateStatus?: ValidateStatus;
  onSelect?: (data?: ITreeNodeData) => void;
  onClear?: () => void;
  showClear?: boolean;
  trigger?: ReactNode;
  onPopoverVisibleChange?: (visible: boolean) => void;
  renderExtraOption?: (
    data?: TreeNodeData[],
    action?: {
      hiddenPopover: () => void;
    },
  ) => ReactNode;
  popoverStyle?: React.CSSProperties;
}

const SELECT_POPOVER_CLASS = 'tree-variable-selector-popover';
const DEFAULT_MIN_WIDTH = 200;

export const CompositeSelect: FC<CompositeSelectProps> = props => {
  const {
    value,
    treeData,
    placeholder,
    emptyContent,
    disabled,
    readonly,
    validateStatus,
    onSelect,
    onBlur,
    showClear,
    onClear,
    trigger,
    onPopoverVisibleChange,
    renderExtraOption,
    popoverStyle = {},
  } = props;
  const { query, setQuery, testId, valueSubVariableMeta } =
    useTreeVariableSelectorContext();
  const [activeOption, setActiveOption] = useState<string | undefined>(
    value?.[0],
  );

  const [focus, setFocus] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    setFocus(true);
    inputRef.current?.focus();
  };

  const handleVisibilityChange = (visibility: boolean) => {
    if (!visibility) {
      setFocus(false);
      setQuery?.('');
    }
    setPopoverVisible(visibility);
    onPopoverVisibleChange?.(visibility);
  };

  const getOptionPopupContainer = useCallback(
    () =>
      (document.querySelector(`.${SELECT_POPOVER_CLASS}`) as HTMLElement) ||
      document.body,
    [],
  );

  const handleOptionHover = useCallback(
    (option: TreeNodeData) => {
      setActiveOption(option?.value as string);
    },
    [setActiveOption],
  );

  const handleSelect = useCallback(
    (data?: TreeNodeData) => {
      onSelect?.(data);
      setPopoverVisible(false);
    },
    [onSelect, setPopoverVisible],
  );

  const renderExtraOptionWithWrapper = () => {
    const extraOptionNode = renderExtraOption?.(treeData, {
      hiddenPopover: () => setPopoverVisible(false),
    });

    if (!extraOptionNode) {
      return undefined;
    }

    return (
      <div onMouseOver={() => setActiveOption(undefined)}>
        {extraOptionNode}
      </div>
    );
  };

  return (
    <Popover
      className={SELECT_POPOVER_CLASS}
      motion={false}
      position="bottomLeft"
      trigger="click"
      visible={popoverVisible}
      onVisibleChange={handleVisibilityChange}
      style={{
        minWidth: triggerRef.current?.clientWidth || DEFAULT_MIN_WIDTH,
        maxWidth: 340,
        borderRadius: 8,
        ...popoverStyle,
      }}
      content={
        <CompositeSelectTreePanel
          treeData={treeData}
          activeOption={activeOption}
          emptyContent={emptyContent}
          onSelect={handleSelect}
          onOptionHover={handleOptionHover}
          getOptionPopupContainer={getOptionPopupContainer}
          extraOption={renderExtraOptionWithWrapper()}
          value={value}
        />
      }
    >
      {trigger ? (
        trigger
      ) : (
        <div
          ref={triggerRef}
          role="combobox"
          data-testid={testId}
          className={classnames(
            'semi-select semi-select-small relative !w-full flex bg-transparent rounded-[6px]',
            styles['composite-select'],
            {
              [styles['composite-select-focus']]: focus,
              'pointer-events-auto': !readonly,
              'pointer-events-none': readonly,
              [styles['composite-select-error']]: validateStatus === 'error',
              [styles['has-value']]: !!value?.length,
              [styles['show-clear']]: showClear,
            },
          )}
          onFocus={handleFocus}
          onBlur={onBlur as unknown as React.FocusEventHandler<HTMLDivElement>}
        >
          <div
            className={classnames('relative pl-1 flex-1', {
              'cursor-not-allowed': disabled || readonly,
            })}
            onClick={e => {
              if (disabled || readonly) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {!query && value?.length ? (
              <ValueDisplay
                className={classnames({
                  'opacity-60': focus,
                })}
              />
            ) : null}
            <div className="h-full flex items-center">
              <Input
                ref={inputRef}
                borderless
                placeholder={valueSubVariableMeta ? '' : placeholder}
                className={classnames(
                  'h-full !bg-transparent !hover:border-none !p-0.5 flex items-center',
                  styles['composite-select-input-wrapper'],
                )}
                disabled={disabled}
                value={query}
                onChange={setQuery}
                size="small"
              />
            </div>
          </div>

          <div
            className={classnames(
              'semi-select-arrow w-6 h-full right-0 flex items-center justify-center',
              {
                'cursor-not-allowed': disabled || readonly,
              },
            )}
            onClick={e => {
              if (disabled || readonly) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {!disabled && !readonly && (
              <IconClear
                className={styles['select-clear']}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClear?.();
                }}
              />
            )}
            <IconCozArrowDown
              className={`text-base ${styles['select-arrow-down']}`}
            />
          </div>
        </div>
      )}
    </Popover>
  );
};
