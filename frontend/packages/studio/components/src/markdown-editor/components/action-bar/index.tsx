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

/* eslint-disable @coze-arch/no-deep-relative-import -- svg */
import { useState, type ComponentProps, type CSSProperties } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Toast, Tooltip, UIButton, Upload } from '@coze-arch/bot-semi';
import { IconLinkStroked } from '@coze-arch/bot-icons';

import {
  InsertLinkPopover,
  type InsertLinkPopoverProps,
} from '../insert-link-popover';
import { getFixedVariableTemplate } from '../../utils/onboarding-variable';
import { type TriggerAction } from '../../type';
import { getIsFileFormatValid } from '../../helpers/get-is-file-format-valid';
import { OnboardingVariable } from '../../constant/onboarding-variable';
import { getFileSizeReachLimitI18n, MAX_FILE_SIZE } from '../../constant/file';
import { ReactComponent as IconMemberOutlined } from '../../../../assets/icon_member_outlined.svg';
import { ReactComponent as IconImageOutlined } from '../../../../assets/icon_image_outlined.svg';

import styles from './index.module.less';

const SHOW_ADD_NAME_BTN = false;

export interface ActionBarProps {
  className?: string;
  style?: CSSProperties;
  onTriggerAction?: (action: TriggerAction) => void;
  disabled?: boolean;
}

const iconButtonProps: ComponentProps<typeof UIButton> = {
  size: 'small',
  type: 'tertiary',
  theme: 'borderless',
  className: styles['icon-button'],
};
export const ActionBar: React.FC<ActionBarProps> = ({
  className,
  style,
  onTriggerAction,
  disabled,
}) => {
  const [visible, setVisible] = useState(false);

  const togglePopoverVisible = () => {
    setVisible(e => !e);
  };

  const closePopover = () => {
    setVisible(false);
  };

  const onConfirmInsertLink: InsertLinkPopoverProps['onConfirm'] = param => {
    closePopover();
    onTriggerAction?.({ type: 'link', sync: true, payload: param });
  };

  const onInsertImage = (file: File) => {
    onTriggerAction?.({ type: 'image', payload: { file }, sync: false });
  };

  const onInsertVariable = () => {
    onTriggerAction?.({
      type: 'variable',
      payload: {
        variableTemplate: getFixedVariableTemplate(
          OnboardingVariable.USER_NAME,
        ),
      },
      sync: true,
    });
  };

  const showFileTypeInvalidToast = () =>
    Toast.warning({
      showClose: false,
      content: I18n.t('file_format_not_supported'),
    });

  const showFileSizeInvalidToast = () =>
    Toast.warning({
      showClose: false,
      content: getFileSizeReachLimitI18n(),
    });
  const onFileChange = (files: File[]) => {
    const file = files.at(0);
    if (!file) {
      return;
    }

    if (!getIsFileFormatValid(file)) {
      showFileTypeInvalidToast();
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showFileSizeInvalidToast();
      return;
    }
    onInsertImage(file);
  };

  return (
    <div className={classNames(className, styles['action-bar'])} style={style}>
      <Upload
        accept="image/*"
        limit={1}
        onFileChange={onFileChange}
        action="/"
        fileList={[]}
        disabled={disabled}
      >
        <Tooltip disableFocusListener content={I18n.t('add_image')}>
          <UIButton
            {...iconButtonProps}
            icon={<IconImageOutlined />}
            disabled={disabled}
          />
        </Tooltip>
      </Upload>

      <InsertLinkPopover
        visible={visible}
        onClickOutSide={closePopover}
        onConfirm={onConfirmInsertLink}
      >
        <span>
          <Tooltip disableFocusListener content={I18n.t('add_link')}>
            <UIButton
              onClick={togglePopoverVisible}
              {...iconButtonProps}
              className={classNames(
                visible && styles['icon-button-active'],
                styles['icon-button'],
              )}
              icon={<IconLinkStroked />}
              disabled={disabled}
            />
          </Tooltip>
        </span>
      </InsertLinkPopover>

      {/* Temporarily disabled, later released */}
      {SHOW_ADD_NAME_BTN && (
        <Tooltip content={I18n.t('add_nickname')}>
          <UIButton
            {...iconButtonProps}
            icon={<IconMemberOutlined />}
            disabled={disabled}
            onClick={onInsertVariable}
          />
        </Tooltip>
      )}
    </div>
  );
};
