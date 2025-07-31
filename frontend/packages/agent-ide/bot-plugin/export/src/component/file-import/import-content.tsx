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

import React, { forwardRef, useState } from 'react';

import classNames from 'classnames';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  type RenderFileItemProps,
  type FileItem,
  type UploadProps,
} from '@coze-arch/bot-semi/Upload';
import { type TextAreaProps } from '@coze-arch/bot-semi/Input';
import {
  Progress,
  TextArea,
  Typography,
  UIButton,
  UIIconButton,
  UIToast,
  Upload,
  Image,
} from '@coze-arch/bot-semi';
import { IconDeleteOutline, IconError } from '@coze-arch/bot-icons';

import YAMLImg from '@/assets/yaml.png';
import JsonImg from '@/assets/json-file.png';

import { getContent, getFileExtension } from './utils';
import { ACCEPT_EXT, ACCEPT_FORMAT } from './const';

import styles from './import-content.module.less';
export interface FileUploadProps {
  onUpload: (content?: string) => void;
  disabled?: boolean;
}

type SemiTextAreaProps = Omit<TextAreaProps, 'forwardRef'>;
interface RawTextProps extends SemiTextAreaProps {
  onChange: (val?: string) => void;
}

export const FileUpload = ({ onUpload, disabled }: FileUploadProps) => {
  const [fileList, setFileList] = useState<FileItem[]>([]);

  const customRequest: UploadProps['customRequest'] = async options => {
    const { onSuccess, file, onError, onProgress } = options;

    if (typeof file === 'string') {
      return;
    }

    try {
      const { name, fileInstance } = file;

      if (fileInstance) {
        const extension = getFileExtension(name);
        if (!ACCEPT_FORMAT.includes(extension)) {
          return;
        }
        const result = await getContent(fileInstance, onProgress);
        onSuccess(result);
      }
    } catch (error) {
      logger.error({
        eventName: 'fail_to_read_file',
        // @ts-expect-error -- linter-disable-autofix
        error,
      });
      onError({ status: 0 });
    }
  };

  const renderFileItem = (renderFileItemProps: RenderFileItemProps) => {
    const { name, onRemove, onRetry, percent, status } = renderFileItemProps;
    const renderProgress = () => {
      switch (status) {
        case 'success':
          return (
            <Typography.Text className={styles['upload-text']} ellipsis>
              {I18n.t('file_upload_success')}
            </Typography.Text>
          );
        case 'uploadFail':
        case 'validateFail':
          return (
            <>
              <IconError />
              <UIButton
                theme="borderless"
                className="ml-[8px]"
                onClick={onRetry}
              >
                {I18n.t('retry')}
              </UIButton>
            </>
          );
        case 'uploading':
        case 'wait':
        case 'validating':
        default:
          return (
            <div className={classNames('w-[90px]')}>
              <Progress percent={percent} />
            </div>
          );
      }
    };

    return (
      <div
        className={classNames(
          styles['upload-file-item'],
          disabled && styles.disabled,
        )}
      >
        <Image
          preview={false}
          className={styles['file-icon']}
          src={getFileExtension(name) === 'yaml' ? YAMLImg : JsonImg}
        />
        <Typography.Text
          className={styles.text}
          ellipsis={{ showTooltip: { opts: { content: name } } }}
        >
          {name}
        </Typography.Text>
        {<div className={styles.progress}>{renderProgress()}</div>}
        <UIIconButton
          icon={
            <IconDeleteOutline
              className={styles['delete-icon']}
              onClick={onRemove}
            />
          }
        />
      </div>
    );
  };

  return (
    <Upload
      accept={ACCEPT_EXT.join(',')}
      action=""
      onAcceptInvalid={() => {
        UIToast.warning(I18n.t('file_format_not_supported'));
      }}
      onSuccess={res => {
        onUpload(res);
      }}
      disabled={disabled}
      fileList={fileList}
      onChange={({ fileList: list }) => {
        setFileList(list);
        if (!list.length) {
          // Clear content
          onUpload();
        }
      }}
      className={classNames(
        styles['upload-file-area'],
        fileList.length && styles['drag-area-disabled'],
      )}
      dragMainText={I18n.t('click_upload_or_drag_files')}
      draggable={true}
      dragSubText={
        <>
          <span>{I18n.t('supports_uploading_json_or_yaml_files')}</span>
          <a
            href={
              IS_OVERSEA
                ? '/open/docs/guides/plugin_import'
                : '/open/docs/guides/import'
            }
            target="_blank"
            onClick={e => e.stopPropagation()}
          >
            {I18n.t('view_detailed_information')}
          </a>
        </>
      }
      renderFileItem={renderFileItem}
      limit={1}
      customRequest={customRequest}
    />
  );
};

export const RawText = forwardRef<HTMLTextAreaElement | null, RawTextProps>(
  (props, ref) => {
    const { onChange, ...extraProps } = props;
    return (
      <TextArea
        placeholder={I18n.t('enter_raw_content_or_url')}
        rows={17}
        {...extraProps}
        ref={ref}
        onChange={value => {
          onChange(value.trim());
        }}
        className={styles['text-area']}
      />
    );
  },
);
