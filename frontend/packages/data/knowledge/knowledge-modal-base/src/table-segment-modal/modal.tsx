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

import React, { useState, type ComponentProps } from 'react';

import { ImageRender } from '@coze-common/table-view';
import { I18n } from '@coze-arch/i18n';
import { ColumnType } from '@coze-arch/bot-api/memory';
import { IconCozImage } from '@coze-arch/coze-design/icons';
import { TextArea, Button, Modal } from '@coze-arch/coze-design';

import { type TableDataItem } from './hooks';

import styles from './index.module.less';

export interface TableSegmentModalProps extends ComponentProps<typeof Modal> {
  tableData: TableDataItem[];
  canEdit: boolean;
  handleTextAreaChange: (index: number, value: string) => void;
  onCancel: (e: React.MouseEvent<Element, MouseEvent>) => void;
  onSubmit: () => void;
  loading?: boolean;
}

interface RenderFooterProps {
  loading?: boolean;
  onCancel: (e: React.MouseEvent<Element, MouseEvent>) => void;
  onSubmit: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

interface TableColumn {
  key: string;
  title: string;
  render?: (item: TableDataItem, index: number) => React.ReactNode;
}

interface TableSegmentContentProps {
  columns: TableColumn[];
  tableData: TableDataItem[];
  canEdit: boolean;
  handleTextAreaChange: (index: number, value: string) => void;
}

export const getSrcFromImg = (str: string): string[] => {
  if (!str) {
    return [];
  }
  const imgRegx = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
  // Matching using regular expressions
  const matches = str.match(imgRegx);

  // Extract the value of the src attribute from the matching result
  const srcList: string[] = [];
  if (matches) {
    for (const match of matches) {
      const src = match.match(/src\s*=\s*['"]([^'"]+)['"]/)?.[1];
      if (src) {
        srcList.push(src);
      }
    }
  }
  return srcList;
};

const TableSegmentContent: React.FC<TableSegmentContentProps> = ({
  columns,
  tableData,
  canEdit,
}) => (
  <div
    className={`${styles['table-content-modal']} ${
      canEdit ? '' : styles['has-preview-modal']
    }`}
  >
    <div className={styles['table-header']}>
      <div className={`${styles['table-row']} ${styles['header-row']}`}>
        {columns.map(column => (
          <div key={column.key} className={styles[column.key]}>
            {column.title}
          </div>
        ))}
      </div>
    </div>
    <div className={styles['table-body']}>
      {tableData.map((item, index) => (
        <div
          className={`${styles['table-row']} ${styles['tbody-row']}`}
          key={index}
        >
          {columns.map(column => (
            <div key={column.key} className={styles[column.key]}>
              {typeof column.render === 'function'
                ? column.render(item, index)
                : item[column.key as keyof TableDataItem]}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const RenderFooter: React.FC<RenderFooterProps> = ({ ...modalProps }) => (
  <>
    <Button color="primary" onClick={modalProps.onCancel}>
      {I18n.t('datasets_createFileModel_CancelBtn')}
    </Button>
    <Button
      loading={modalProps.loading}
      onClick={e => {
        modalProps.onSubmit?.(e);
      }}
    >
      {I18n.t('datasets_segment_detailModel_save')}
    </Button>
  </>
);
const OptimizedTextArea: React.FC<{
  index: number;
  value?: string;
  disabled: boolean;
  error?: string;
  handleTextAreaChange: (index: number, value: string) => void;
}> = React.memo(
  ({ index, disabled, error, value: initialValue, handleTextAreaChange }) => {
    const [value, setValue] = useState(initialValue);

    const onBlur = () => handleTextAreaChange(index, value || '');

    return (
      <TextArea
        disabled={disabled}
        value={value}
        onChange={setValue}
        onBlur={onBlur}
        autosize={{ minRows: 1, maxRows: 3 }}
        maxLength={2000}
        style={{ border: error ? '1px solid #F93920' : '' }}
      />
    );
  },
);

const ImageEmpty = (props: { onClick?: () => void }) => (
  <Button
    color="highlight"
    icon={<IconCozImage className="text-[14px]" />}
    {...props}
  >
    {I18n.t('knowledge_insert_img_002')}
  </Button>
);
export const TableSegmentModal: React.FC<TableSegmentModalProps> = ({
  onCancel,
  onSubmit,
  tableData,
  canEdit,
  handleTextAreaChange,
  loading,
  ...modalProps
}) => {
  const columns: TableColumn[] = [
    {
      key: 'column_name',
      title: I18n.t('datasets_segment_tableStructure_field_name'),
    },
    {
      key: 'is_semantic',
      title: I18n.t('datasets_segment_tableStructure_semantic_name'),
      render: item =>
        item.is_semantic
          ? I18n.t('datasets_segment_tableStructure_semantic_yes')
          : I18n.t('datasets_segment_tableStructure_semantic_no'),
    },
    {
      key: 'value',
      title: I18n.t('datasets_segment_tableStructure_field_value'),
      render: (item, index) =>
        item.column_type === ColumnType.Image ? (
          <div className={styles['image-render-wrapper']}>
            <ImageRender
              className={
                item.value ? 'modal-image-render' : 'modal-empty-image-render'
              }
              customEmpty={props => <ImageEmpty {...(props || {})} />}
              srcList={getSrcFromImg(item.value)}
              onChange={(src, tosKey) => {
                let val = '';
                if (src || tosKey) {
                  val = `<img src="${src ?? ''}" ${
                    tosKey ? `data-tos-key="${tosKey}"` : ''
                  }>`;
                }
                handleTextAreaChange(index, val);
              }}
            />
          </div>
        ) : (
          <div>
            <OptimizedTextArea
              index={index}
              disabled={!canEdit}
              value={item.value}
              handleTextAreaChange={handleTextAreaChange}
              error={item.error}
            />
            {item.error ? (
              <div className={styles['error-tips']}>{item.error}</div>
            ) : null}
          </div>
        ),
    },
  ];

  return (
    <Modal
      size="medium"
      centered
      maskClosable={false}
      keepDOM={false}
      onCancel={onCancel}
      footer={
        <RenderFooter
          onCancel={onCancel}
          loading={loading}
          onSubmit={() => {
            onSubmit();
          }}
        />
      }
      {...modalProps}
    >
      <TableSegmentContent
        tableData={tableData}
        canEdit={canEdit}
        columns={columns}
        handleTextAreaChange={handleTextAreaChange}
      />
    </Modal>
  );
};
