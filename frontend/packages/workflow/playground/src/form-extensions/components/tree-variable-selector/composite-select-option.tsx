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

import classnames from 'classnames';
import { isGlobalVariableKey } from '@coze-workflow/variable';
import { useNodeTestId, type ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { IconCozArrowRight } from '@coze-arch/coze-design/icons';
import { Popover } from '@coze-arch/coze-design';

import { useGlobalState } from '@/hooks';
import {
  BotProjectVariableSelect,
  EmptyVariableContent,
} from '@/components/test-run/bot-project-variable-select';

import { SelectType } from './types';
import { NodeVariableTree } from './node-variable-tree';
import { useTreeVariableSelectorContext } from './context';

import styles from './index.module.less';

interface CompositeSelectOptionProps {
  data: TreeNodeData & { type?: ViewVariableType };
  active?: boolean;
  selected?: boolean;
  onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onSelect?: (data?: TreeNodeData, type?: SelectType) => void;
  getPopupContainer?: () => HTMLElement;
}

export const CompositeSelectOption = React.forwardRef(
  (props: CompositeSelectOptionProps, ref) => {
    const { testId = '' } = useTreeVariableSelectorContext();
    const {
      data,
      active,
      onMouseOver,
      onMouseLeave,
      onSelect,
      getPopupContainer,
      selected,
    } = props;

    const { isInIDE } = useGlobalState();
    const useNewGlobalVariableCache = !isInIDE;
    const isGlobalVar = isGlobalVariableKey(`${data.value || ''}`);

    const hasContent =
      (isGlobalVar && useNewGlobalVariableCache) ||
      Boolean(data.children?.length);

    const { concatTestId } = useNodeTestId();

    return (
      <div
        className="w-full relative"
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
      >
        <Popover
          getPopupContainer={getPopupContainer}
          motion={false}
          autoAdjustOverflow
          position="leftTop"
          trigger="custom"
          visible={active && hasContent}
          rePosKey={Math.random()}
          style={{
            borderRadius: 8,
            transform: 'translateY(-4px)',
          }}
          content={
            isGlobalVar && useNewGlobalVariableCache ? (
              <BotProjectVariableSelect
                className={'!p-0'}
                relatedBotPanelStyle={{
                  width: '254px',
                  height: 'unset',
                  maxHeight: '290px',
                }}
                customVariablePanel={
                  <NodeVariableTree
                    ref={ref}
                    dataSource={data.children}
                    onSelect={onSelect}
                    className={styles['bot-select-node-variable-tree']}
                    innerTreeStyle={{
                      width: '254px',
                      minWidth: 'unset',
                    }}
                    outerTopSlot={
                      data.children && data.children.length > 0 ? (
                        <div
                          className={
                            'coz-fg-secondary mt-8px mb-4px pl-28px text-[12px] font-medium leading-16px'
                          }
                        >
                          {I18n.t(
                            'variable_binding_please_select_a_variable',
                            {},
                            '请选择变量',
                          )}
                        </div>
                      ) : undefined
                    }
                    emptyContent={
                      <EmptyVariableContent className={'pt-32px pb-32px'} />
                    }
                  />
                }
              />
            ) : (
              <NodeVariableTree
                ref={ref}
                dataSource={data.children}
                onSelect={onSelect}
              />
            )
          }
        >
          <div
            data-testid={concatTestId(testId, data.name)}
            className={classnames(
              'p-1 flex items-center cursor-pointer hover:coz-mg-primary active:coz-mg-primary-pressed h-6 rounded-[4px]',
              {
                'coz-mg-primary': active,
              },
            )}
            onClick={() => {
              onSelect?.(data, SelectType.Option);
            }}
          >
            <div className={styles['option-icon-wrapper']}>{data.icon}</div>
            <div
              className={classnames('flex-1 ml-1 truncate text-xs', {
                'coz-fg-hglt font-semibold': selected,
              })}
            >
              {data.label}
            </div>
            {hasContent ? (
              <IconCozArrowRight className="coz-fg-secondary" />
            ) : null}
          </div>
        </Popover>
      </div>
    );
  },
);
