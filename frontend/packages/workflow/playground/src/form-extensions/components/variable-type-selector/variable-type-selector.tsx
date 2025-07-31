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
  useMemo,
  type CSSProperties,
  type PropsWithChildren,
} from 'react';

import classNames from 'classnames';
import {
  VARIABLE_TYPE_ALIAS_MAP,
  type ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozArrowDown,
  IconCozArrowRight,
  IconCozCheckMarkFill,
} from '@coze-arch/coze-design/icons';
import {
  Dropdown,
  Tooltip,
  type DropdownProps,
  type SelectProps,
  Typography,
} from '@coze-arch/coze-design';

import {
  allVariableTypeList,
  getSelectedValuePath,
  getVariableTypeList,
  VARIABLE_TYPE_DIVIDER,
  type VariableTypeOption,
} from './utils';
import { VARIABLE_TYPE_ICONS_MAP } from './constants';

import styles from './index.module.less';

export interface VariableTypeSelectorProps {
  value: ViewVariableType;
  level?: number;
  onChange?: SelectProps['onChange'];
  readonly?: boolean;
  disabled?: boolean;
  /** Types not supported */
  disabledTypes?: ViewVariableType[];
  /** hidden type */
  hiddenTypes?: ViewVariableType[];
  validateStatus?: SelectProps['validateStatus'];
  onBlur?: () => void;
  onFocus?: () => void;
  testId?: string;
  disableDropdown?: boolean;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  refVariableType?: ViewVariableType;
}

export function VariableTypeSelector({
  value,
  onChange,
  onFocus,
  onBlur,
  level,
  readonly,
  disabled,
  disabledTypes = [],
  hiddenTypes = [],
  validateStatus,
  testId,
  contentClassName,
  contentStyle,
  disableDropdown,
  children,
  refVariableType,
}: PropsWithChildren<VariableTypeSelectorProps>) {
  const optionList = useMemo(
    () => getVariableTypeList({ disabledTypes, hiddenTypes, level }),
    [disabledTypes, hiddenTypes, level],
  );

  const selectedValuePath = useMemo(
    () => getSelectedValuePath(value, allVariableTypeList),
    [value],
  );

  const handleSelect = (val: ViewVariableType) => {
    onChange?.(val);
  };

  const warningMessage = useMemo(() => {
    if (disableDropdown || !refVariableType || refVariableType === value) {
      return '';
    }
    return I18n.t('workflow_refer_var_type_same', {
      type: VARIABLE_TYPE_ALIAS_MAP[refVariableType],
    });
  }, [refVariableType, value, disableDropdown]);

  const renderContent = (selected: Array<string | number>) =>
    children ? (
      children
    ) : (
      <div className={contentClassName} style={contentStyle}>
        <Tooltip
          style={{
            pointerEvents: 'none',
            transform: warningMessage ? 'translateX(-8px)' : 'none',
          }}
          content={
            <div className="flex flex-col items-start gap-[6px]">
              <Typography.Text size="small" weight={500}>
                {VARIABLE_TYPE_ALIAS_MAP[selected[selected.length - 1]]}
              </Typography.Text>
              {warningMessage ? (
                <Typography.Text size="small" className="coz-fg-hglt-yellow">
                  {warningMessage}
                </Typography.Text>
              ) : null}
            </div>
          }
        >
          <div
            data-testid={testId}
            className={classNames(
              `flex items-center gap-0.5 p-[1px] h-full ${
                readonly || disabled || disableDropdown
                  ? 'cursor-auto'
                  : 'cursor-pointer'
              }`,
              {
                'hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed':
                  !disableDropdown && !disabled && !readonly,
              },
            )}
          >
            <span
              className={classNames('coz-fg-secondary p-[2px] flex', {
                'coz-mg-hglt-secondary-yellow rounded-[4px]':
                  Boolean(warningMessage),
              })}
            >
              {VARIABLE_TYPE_ICONS_MAP[selected[selected.length - 1]]}
            </span>
            {disableDropdown ? null : (
              <IconCozArrowDown className="coz-fg-secondary" />
            )}
          </div>
        </Tooltip>
      </div>
    );

  const renderDropdown = (
    menus: VariableTypeOption[],
    content: React.ReactNode,
    props: Pick<DropdownProps, 'trigger' | 'position'>,
  ) => (
    <Dropdown
      {...props}
      className={styles.dropdwon}
      clickToHide={true}
      onVisibleChange={visible => {
        visible ? onFocus?.() : onBlur?.();
      }}
      motion={false}
      render={
        <Dropdown.Menu
          className="min-w-[160px]"
          selectedKeys={[selectedValuePath.join('/')]}
        >
          {menus.map(menu => {
            if (menu === VARIABLE_TYPE_DIVIDER) {
              return <Dropdown.Divider />;
            }
            const itemContent = (
              <Dropdown.Item
                showTick={true}
                icon={<IconCozCheckMarkFill className="coz-fg-hglt" />}
                itemKey={menu.path?.join('/')}
                disabled={menu.disabled}
                onClick={() => {
                  if (menu.children?.length) {
                    return;
                  }
                  handleSelect(menu.value as ViewVariableType);
                }}
              >
                {menu.children?.length ? (
                  <div className="flex items-center justify-between w-[112px]">
                    {menu.label}
                    <IconCozArrowRight />
                  </div>
                ) : (
                  menu.label
                )}
              </Dropdown.Item>
            );
            if (menu.children?.length) {
              return renderDropdown(menu.children, itemContent, {
                trigger: 'hover',
                position: 'leftTop',
              });
            }
            return itemContent;
          })}
        </Dropdown.Menu>
      }
    >
      {content}
    </Dropdown>
  );

  if (disableDropdown || disabled || readonly) {
    return renderContent(selectedValuePath);
  }

  return renderDropdown(optionList, renderContent(selectedValuePath), {
    trigger: 'click',
    position: 'bottomLeft',
  });
}
