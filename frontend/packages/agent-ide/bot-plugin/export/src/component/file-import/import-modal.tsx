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

import { useState, useEffect, useRef } from 'react';

import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  UIButton,
  UIModal,
  RadioGroup,
  Radio,
  Typography,
} from '@coze-arch/bot-semi';

import { isValidURL, customService } from './utils';
import { FileUpload, RawText } from './import-content';

import styles from './import-modal.module.less';

export enum ImportType {
  File = 'File',
  Text = 'Text',
}

enum ImportDetailType {
  File = 'file',
  FileUrl = 'file_url',
  Text = 'raw_txt',
}
export interface ImportData {
  type?: ImportDetailType;
  content?: string;
}

export interface ImportModalProps {
  visible: boolean;
  title?: React.ReactNode;
  onCancel?: () => void;
  onOk?: (
    data: ImportData,
  ) => Promise<{ success?: boolean; result?: unknown; errMsg?: string }>;
}

export const ImportModal: React.FC<ImportModalProps> = props => {
  const { onCancel, visible, onOk, title } = props;
  const [importType, setImportType] = useState(ImportType.File);
  const [content, setContent] = useState<string>();
  const [errMsg, setErrMsg] = useState<string>();
  const [loading, setLoading] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleContent = (text?: string) => {
    setContent(text);
  };

  const reset = () => {
    setImportType(ImportType.File);
    setContent(undefined);
  };

  const handleParse = async () => {
    setLoading(true);
    setErrMsg(undefined);
    let originContent = content;
    let type: ImportDetailType =
      importType === ImportType.Text
        ? ImportDetailType.Text
        : ImportDetailType.File;
    if (importType === ImportType.Text && isValidURL(content)) {
      try {
        const res = await customService(content || '');
        originContent = res as unknown as string;
        type = ImportDetailType.FileUrl;
      } catch (e) {
        // @ts-expect-error -- linter-disable-autofix
        logger.error({ error: e, eventName: 'fetch_url_resource_fail' });
        setErrMsg(I18n.t('unable_to_access_input_url'));
        setLoading(false);
        return Promise.reject(e);
      }
    }
    try {
      const res = await onOk?.({ type, content: originContent });
      if (!res?.success) {
        setErrMsg(res?.errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFooter = () => (
    <UIButton
      theme="solid"
      type="primary"
      disabled={!content}
      onClick={handleParse}
      loading={loading}
    >
      {I18n.t('next')}
    </UIButton>
  );

  const renderErrMsg = () =>
    errMsg ? (
      <Typography.Text
        ellipsis={{
          showTooltip: {
            opts: { content: errMsg },
          },
        }}
      >
        {errMsg}
      </Typography.Text>
    ) : null;

  useEffect(() => {
    errMsg && setErrMsg(undefined);
  }, [content]);

  useEffect(() => {
    if (visible) {
      reset();
    }
  }, [visible]);

  useEffect(() => {
    if (importType === ImportType.Text && textAreaRef.current) {
      textAreaRef?.current?.focus();
    }
  }, [importType]);

  return (
    <>
      <UIModal
        afterClose={reset}
        keepDOM={false}
        type="action-small"
        title={title}
        visible={visible}
        onCancel={onCancel}
        onOk={handleParse}
        footer={renderFooter()}
        className={styles['import-modal']}
      >
        <div className="min-h-[472px]">
          <div className="flex justify-center mb-[24px]">
            <RadioGroup
              onChange={e => {
                setImportType(e.target.value);
                setContent(undefined);
              }}
              type="button"
              buttonSize="middle"
              defaultValue={importType}
              disabled={loading}
              className={styles['radio-group']}
            >
              <Radio value={ImportType.File}>{I18n.t('local_file')}</Radio>
              <Radio value={ImportType.Text}>{I18n.t('url_raw_data')}</Radio>
            </RadioGroup>
          </div>
          <div>
            {importType === ImportType.File ? (
              <FileUpload onUpload={handleContent} disabled={loading} />
            ) : (
              <RawText
                onChange={handleContent}
                disabled={loading}
                ref={textAreaRef}
              />
            )}
          </div>
          <div className={styles['error-msg']}> {renderErrMsg()}</div>
        </div>
      </UIModal>
    </>
  );
};
