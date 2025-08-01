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

import {
  type PropsWithChildren,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Popover, Typography } from '@coze-arch/bot-semi';
import { type shortcut_command } from '@coze-arch/bot-api/playground_api';

import { InputTypeTag } from './var-list';
import { componentTypeOptionMap } from './util';

export interface ComponentsSelectPopoverProps {
  autoFocusFirst?: boolean;
  visible: boolean;
  components?: ValidComponents[];
  onClose: () => void;
  onChange: (component: ValidComponents) => void;
}

export interface ComponentsSelectPopoverActions {
  setHover: Dispatch<SetStateAction<number>>;
  select: () => void;
}

export type ValidComponents = shortcut_command.Components &
  Required<Pick<shortcut_command.Components, 'input_type' | 'name'>>;

export const ComponentsSelectPopover = forwardRef<
  ComponentsSelectPopoverActions,
  PropsWithChildren<ComponentsSelectPopoverProps>
>(
  (
    { components = [], visible, onChange, children, onClose, autoFocusFirst },
    ref,
  ) => {
    useImperativeHandle(ref, () => ({
      setHover: param => {
        const newIndex = typeof param === 'number' ? param : param(hoverIndex);
        const targetDom = optionsDomRef.current[newIndex];
        setHoverIndex(newIndex);
        if (targetDom) {
          targetDom.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      },
      select: () => {
        const hoverComponent = components[hoverIndex];
        hoverComponent && onChange(hoverComponent);
        onClose();
      },
    }));

    const optionsDomRef = useRef<(HTMLDivElement | null)[]>([]);

    const [hoverIndex, setHoverIndex] = useState(-1);

    useEffect(() => {
      if (visible) {
        setHoverIndex(autoFocusFirst ? 0 : -1);
      }
    }, [visible]);

    return (
      <Popover
        visible={visible}
        trigger="custom"
        onEscKeyDown={onClose}
        onClickOutSide={onClose}
        onVisibleChange={newVisible => {
          if (!newVisible) {
            onClose();
          }
        }}
        position="bottom"
        className="!rounded-[8px]"
        content={
          <div
            onMouseLeave={() => {
              setHoverIndex(-1);
            }}
            className="p-1 max-h-44 overflow-y-auto box-border"
          >
            {components
              .filter(item => item.input_type !== undefined && item.name)
              .map((item, index) => {
                const type = componentTypeOptionMap[item.input_type]?.label;

                return (
                  <div
                    key={item.name}
                    ref={el => {
                      optionsDomRef.current[index] = el;
                    }}
                    onMouseEnter={() => setHoverIndex(index)}
                    className={classNames(
                      'flex items-center px-2 h-8 gap-2 cursor-pointer rounded-[4px]',
                      {
                        'coz-mg-secondary-hovered': index === hoverIndex,
                      },
                    )}
                    onClick={() => {
                      onChange(item);
                      onClose();
                    }}
                  >
                    <Typography.Text
                      ellipsis={{
                        showTooltip: true,
                      }}
                      className="flex-1"
                    >
                      {item.name}
                    </Typography.Text>
                    {type ? <InputTypeTag>{type}</InputTypeTag> : null}
                  </div>
                );
              })}
            {!components.length && (
              <Typography.Text
                ellipsis={{
                  showTooltip: true,
                }}
                style={{ color: 'rgba(29, 28, 35, 0.35)' }}
                className="flex-1 p-2.5 coz-fg-secondary text-xs"
              >
                {I18n.t('shortcut_modal_query_message_insert_component_button')}
              </Typography.Text>
            )}
          </div>
        }
      >
        {children}
      </Popover>
    );
  },
);
