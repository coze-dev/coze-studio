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

import React, { type FC, useEffect, useState } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { UIButton, Typography, UIIconButton } from '@coze-arch/bot-semi';
import { AssistParameterType } from '@coze-arch/bot-api/plugin_develop';
import { FileTypeEnum } from '@coze-studio/file-kit/logic';
import { ACCEPT_UPLOAD_TYPES } from '@coze-studio/file-kit/config';
import { IconDeleteOutline, IconUploadOutlined1 } from '@coze-arch/bot-icons';

import { ItemErrorTip } from '../item-error-tip';
import { getFileAccept, getFileTypeFromAssistType } from '../../file';
import { PluginFileUpload } from './upload';

import styles from './index.module.less';

const { Text } = Typography;

const fileUnknownIcon = ACCEPT_UPLOAD_TYPES[FileTypeEnum.DEFAULT_UNKNOWN].icon;

export const FileUploadItem: FC<{
  assistParameterType: AssistParameterType;
  onChange?: (uri: string) => void;
  required?: boolean;
  withDescription?: boolean;
  defaultValue?: string;
  check?: number;
  disabled?: boolean;
}> = ({
  onChange,
  required = false,
  withDescription = false,
  check = 0,
  defaultValue,
  disabled = false,
  assistParameterType,
}) => {
  const [isErrorStatus, setIsErrorStatus] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const defaultFileType = getFileTypeFromAssistType(assistParameterType);
  const isImageString = assistParameterType === AssistParameterType.IMAGE;
  const btnText = isImageString
    ? I18n.t('plugin_file_upload_image')
    : I18n.t('plugin_file_upload');
  const errorTip = isImageString
    ? I18n.t('plugin_file_upload_mention_image')
    : I18n.t('plugin_file_upload_mention');
  const accept = getFileAccept(assistParameterType);

  useEffect(() => {
    if (check === 0) {
      return;
    }

    setIsErrorStatus(required && !value);
  }, [check]);

  const onChangeHandler = (uri: string) => {
    setValue(uri);
    onChange?.(uri);
    setIsErrorStatus(required && !uri);
  };

  return (
    <>
      <PluginFileUpload
        defaultUrl={value}
        defaultFileType={defaultFileType}
        onUploadSuccess={onChangeHandler}
        uploadProps={{
          accept,
          disabled,
          maxSize: 20480,
        }}
        render={({ fileState, clearFile }) => {
          const { uploading, uri, url, name, type } = fileState;

          /**
           * Echo, only one url (string), need to be compatible = > do not show icon, url as file name
           */
          const onlyUrlString = !!url && !uri;
          const displayName = onlyUrlString ? value : name;

          let icon: string | undefined = url;

          const uploadButton = (
            <UIButton
              icon={<IconUploadOutlined1 className={styles.icon} />}
              loading={uploading}
              disabled={disabled}
              className="w-full"
            >
              {uploading ? I18n.t('plugin_file_uploading') : btnText}
            </UIButton>
          );

          if (uploading) {
            return uploadButton;
          } else if (onlyUrlString && type === FileTypeEnum.IMAGE) {
            /** The image is not uploaded immediately and cannot be confirmed as a legitimate resource path. */
            icon = fileUnknownIcon;
          } else if (!isImageString) {
            // @ts-expect-error -- linter-disable-autofix
            const typeIcon = ACCEPT_UPLOAD_TYPES[type]?.icon;
            if (typeIcon) {
              icon = typeIcon;
            } else {
              icon = undefined;
            }
          }

          if (onlyUrlString || uri) {
            return (
              <div
                className={classNames(
                  'flex items-center justify-between w-full h-[32px]',
                  disabled ? 'cursor-not-allowed' : '',
                )}
              >
                <div className="flex items-center min-w-0">
                  {icon ? (
                    <img
                      src={icon}
                      className="w-[20px] h-[20px] mr-[5px] rounded-[0.5px]"
                    />
                  ) : null}
                  <Text ellipsis={{ showTooltip: true }} className="mr-[2px]">
                    {displayName}
                  </Text>
                </div>
                <UIIconButton
                  icon={<IconDeleteOutline />}
                  disabled={disabled}
                  onClick={e => {
                    e.stopPropagation();
                    clearFile();
                    onChangeHandler('');
                  }}
                />
              </div>
            );
          }

          return uploadButton;
        }}
      />
      {isErrorStatus ? (
        <ItemErrorTip withDescription={withDescription} tip={errorTip} />
      ) : null}
    </>
  );
};
