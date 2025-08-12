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

import React, { type CSSProperties, useState } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozArrowDown,
  IconCozMouse,
  IconCozTablet,
} from '@coze-arch/coze-design/icons';
import { Popover, Typography } from '@coze-arch/bot-semi';

import { PadIcon } from './icons/pad';
import { MouseIcon } from './icons/mouse';

import styles from './mouse-pad-selector.module.less';

const { Title, Paragraph } = Typography;

export enum InteractiveType {
  Mouse = 'MOUSE',
  Pad = 'PAD',
}

export interface MousePadSelectorProps {
  value: InteractiveType;
  onChange: (value: InteractiveType) => void;
  onPopupVisibleChange?: (visible: boolean) => void;
  containerStyle?: CSSProperties;
  iconStyle?: CSSProperties;
  arrowStyle?: CSSProperties;
}

const IteractiveItem: React.FC<{
  title: string;
  subTitle: string;
  icon: React.ReactNode;
  value: InteractiveType;
  selected: boolean;
  onChange: (value: InteractiveType) => void;
}> = ({ title, subTitle, icon, onChange, value, selected }) => (
  <div
    className={cls({
      [styles['mouse-pad-option']]: true,
      [styles['mouse-pad-option-selected']]: selected,
    })}
    onClick={() => onChange(value)}
  >
    <div
      className={cls({
        [styles['mouse-pad-option-icon']]: true,
        [styles['mouse-pad-option-icon-selected']]: selected,
      })}
    >
      {icon}
    </div>
    <Title
      heading={6}
      className={cls({
        [styles['mouse-pad-option-title']]: true,
        [styles['mouse-pad-option-title-selected']]: selected,
      })}
    >
      {title}
    </Title>
    <Paragraph
      type="tertiary"
      className={cls({
        [styles['mouse-pad-option-subTitle']]: true,
        [styles['mouse-pad-option-subTitle-selected']]: selected,
      })}
    >
      {subTitle}
    </Paragraph>
  </div>
);

export const MousePadSelector: React.FC<
  MousePadSelectorProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef(
  (
    {
      value,
      onChange,
      onPopupVisibleChange,
      containerStyle,
      iconStyle,
      arrowStyle,
    },
    ref,
  ) => {
    const isMouse = value === InteractiveType.Mouse;
    const [visible, setVisible] = useState(false);

    return (
      <Popover
        trigger="custom"
        position="topLeft"
        closeOnEsc
        visible={visible}
        onVisibleChange={v => {
          onPopupVisibleChange?.(v);
        }}
        onClickOutSide={() => {
          setVisible(false);
        }}
        spacing={20}
        content={
          <div className={styles['ui-mouse-pad-selector-popover']}>
            <Typography.Title heading={4}>
              {I18n.t('workflow_interactive_mode')}
            </Typography.Title>
            <div className={styles['ui-mouse-pad-selector-popover-options']}>
              <IteractiveItem
                title={I18n.t('workflow_mouse_friendly')}
                subTitle={I18n.t('workflow_mouse_friendly_desc')}
                data-testid="workflow.detail.toolbar.interactive.mouse"
                value={InteractiveType.Mouse}
                selected={value === InteractiveType.Mouse}
                icon={<MouseIcon />}
                onChange={onChange}
              />

              <IteractiveItem
                title={I18n.t('workflow_pad_friendly')}
                subTitle={I18n.t('workflow_pad_friendly_desc')}
                data-testid="workflow.detail.toolbar.interactive.pad"
                value={InteractiveType.Pad}
                selected={value === InteractiveType.Pad}
                icon={<PadIcon />}
                onChange={onChange}
              />
            </div>
          </div>
        }
      >
        <div
          className={cls({
            [styles['ui-mouse-pad-selector']]: true,
            [styles['ui-mouse-pad-selector-active']]: visible,
          })}
          ref={ref}
          onClick={() => {
            setVisible(!visible);
          }}
          style={containerStyle}
        >
          <div
            className={styles['ui-mouse-pad-selector-icon']}
            style={iconStyle}
          >
            {isMouse ? <IconCozMouse /> : <IconCozTablet />}
          </div>

          <div
            className={styles['ui-mouse-pad-selector-arrow']}
            style={arrowStyle}
          >
            <IconCozArrowDown />
          </div>
        </div>
      </Popover>
    );
  },
);
