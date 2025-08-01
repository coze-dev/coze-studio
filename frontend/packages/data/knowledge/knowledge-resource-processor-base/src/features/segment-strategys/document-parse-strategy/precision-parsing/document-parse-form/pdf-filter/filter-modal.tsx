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

import { useEffect, useRef, useState } from 'react';

import { produce } from 'immer';
import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Modal, type ModalProps } from '@coze-arch/coze-design';

import { type PDFDocumentFilterValue } from '@/features/knowledge-type/text';
import { DocumentList } from '@/components/document-list';

import { PDFDocument } from './pdf-document';

import styles from './filter-modal.module.less';

//
export interface PDFFile {
  uri: string;
  url: string;
  name: string;
}

export const FilterModal: React.FC<
  ModalProps & {
    pdfList: PDFFile[];
    value?: PDFDocumentFilterValue[];
    onChange?: (props: PDFDocumentFilterValue[]) => void;
  }
> = ({ pdfList, value, onChange, onCancel: inputOnCancel, ...modalProps }) => {
  const [currentUri, setCurrentUri] = useState(pdfList.at(0)?.uri ?? '');
  const currentFileUrl = pdfList.find(i => i.uri === currentUri)?.url;
  const currentDocValue = value?.find(v => v.uri === currentUri);
  const filterValueCache = useRef<PDFDocumentFilterValue[]>([]);

  const recordFilterValue = (filterValue: PDFDocumentFilterValue[]) => {
    filterValueCache.current = filterValue;
  };
  const resetFilterValue = () => {
    onChange?.(filterValueCache.current);
  };

  const onCancel: ModalProps['onCancel'] = e => {
    resetFilterValue();
    inputOnCancel?.(e);
  };

  useEffect(() => {
    if (!modalProps.visible) {
      return;
    }
    setCurrentUri(pdfList.at(0)?.uri ?? '');
    recordFilterValue(value ?? []);
    return () => {
      filterValueCache.current = [];
    };
  }, [modalProps.visible]);

  return (
    <Modal
      title={I18n.t('kl_write_103')}
      size="xxl"
      maskClosable={false}
      className={styles['filter-modal']}
      cancelText={I18n.t('Cancel')}
      okText={I18n.t('Confirm')}
      onCancel={onCancel}
      {...modalProps}
    >
      <div
        className={cls(
          'flex h-full',
          'border border-solid coz-stroke-primary rounded-[8px]',
          'overflow-hidden',
        )}
      >
        <DocumentList
          className="w-240px p-[16px]"
          documents={pdfList.map(item => ({
            id: item.uri ?? '',
            title: item.name,
            filterPageConfigList:
              value?.find(f => f.uri === item.uri)?.filterPagesConfig ?? [],
          }))}
          value={currentUri}
          onChange={setCurrentUri}
        />
        <div className="border-[0.5px] border-solid coz-stroke-primary h-full w-[1px]"></div>
        {currentUri && currentFileUrl ? (
          <PDFDocument
            enableCropper={false}
            className="flex-[1]"
            uri={currentUri}
            url={currentFileUrl}
            onChange={changedValue => {
              if (!value) {
                onChange?.([changedValue]);
                return;
              }
              const res = produce<PDFDocumentFilterValue[]>(value, draft => {
                const targetIndex = draft.findIndex(
                  v => v.uri === changedValue.uri,
                );

                if (targetIndex < 0) {
                  draft.push(changedValue);
                  return;
                }

                draft[targetIndex] = changedValue;
              });

              onChange?.(res);
            }}
            filterPagesConfig={currentDocValue?.filterPagesConfig ?? []}
            initPageCropperSizePercent={
              currentDocValue?.cropperSizePercent ?? null
            }
          />
        ) : null}
      </div>
    </Modal>
  );
};
