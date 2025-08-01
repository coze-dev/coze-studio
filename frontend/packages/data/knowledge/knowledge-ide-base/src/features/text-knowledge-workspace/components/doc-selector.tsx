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

/* eslint-disable @coze-arch/max-line-per-function */
import { useState } from 'react';

import classNames from 'classnames';
import { useDebounceFn } from 'ahooks';
import { KnowledgeE2e } from '@coze-data/e2e';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconCozEdit } from '@coze-arch/coze-design/icons';
import {
  Popover,
  Select,
  Tooltip,
  Button,
  TextArea,
  Search,
} from '@coze-arch/coze-design';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import { type FormatType } from '@coze-arch/bot-api/knowledge';

import styles from '../styles/index.module.less';

export interface DocSelectorProps<T> {
  type: FormatType;
  options: OptionProps[];
  value: T;
  canEdit?: boolean;
  onChange: (v: T) => void;
  onRename: (docId: string, newName: string) => void;
}

const DOC_NAME_MAX_LEN = 100;
export const DocSelector = ({
  type,
  options,
  value,
  onChange,
  canEdit,
  onRename,
}: DocSelectorProps<typeof value>) => {
  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [docName, setDocName] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const debounceSetSearch = useDebounceFn(
    (v?: string) => {
      setSearchValue(v || '');
    },
    {
      wait: 300,
    },
  );

  const handledOptions = options.filter(op => {
    if (!searchValue) {
      return true;
    }
    try {
      const regx = new RegExp(searchValue);
      // Search results do not show the "All Content" option
      return (
        (op.value !== 'all' && op.value === value) ||
        (op?.text as string)?.match(regx)
      );
    } catch (e) {
      return true;
    }
  });

  const setDocNameFn = () => {
    const name = options.find(op => op.value === value)?.text;
    if (name) {
      setDocName(name as string);
    }
  };

  const handleEditDocName = e => {
    e.stopPropagation();
    setVisible(true);
  };

  const handleSaveDocName = () => {
    if (!docName) {
      return;
    }
    setLoading(true);

    try {
      onRename(value as string, docName);
      setVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const triggerRender = ({ value: values }) => (
    <Popover
      clickToHide={true}
      visible={visible}
      onClickOutSide={() => setVisible(false)}
      trigger="custom"
      style={{ padding: 16, width: 320 }}
      onVisibleChange={v => {
        if (v) {
          setDocNameFn();
        }
      }}
      content={
        <div
          className={styles['edit-doc-name-container']}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles['edit-doc-name-container-title']}>
            {I18n.t('knowledge_detail_doc_rename')}
          </div>
          <div className={styles['edit-doc-name-container-input']}>
            <TextArea
              value={docName}
              maxLength={DOC_NAME_MAX_LEN}
              maxCount={DOC_NAME_MAX_LEN}
              validateStatus={!docName ? 'error' : 'default'}
              placeholder={I18n.t('knowledge_upload_text_custom_doc_name_tips')}
              onChange={v => setDocName(v)}
            />
            {!docName && (
              <div className={styles['edit-doc-name-container-input-error']}>
                {I18n.t('knowledge_upload_text_custom_doc_name_tips')}
              </div>
            )}
          </div>
          <div className="text-right">
            <Button
              disabled={!docName}
              onClick={handleSaveDocName}
              size="small"
              loading={loading}
            >
              {I18n.t('Save')}
            </Button>
          </div>
        </div>
      }
      position="bottomLeft"
    >
      <div
        onClick={() => {
          setVisible(false);
        }}
        className={styles['doc-selector-trigger']}
        data-testid={KnowledgeE2e.SegmentDetailContentSelectTrigger}
      >
        <div className={styles['doc-selector-trigger-label']}>
          {values.map(item => (
            <div key={item.value}>{item.label}</div>
          ))}
        </div>
        {!canEdit || !value ? null : (
          <div>
            <Tooltip
              clickToHide
              theme="dark"
              content={I18n.t('knowledge_detail_doc_rename')}
            >
              <div
                className={styles['doc-selector-trigger-icon']}
                onClick={handleEditDocName}
                data-testid={
                  KnowledgeE2e.SegmentDetailContentSelectTriggerEditIcon
                }
              >
                <IconCozEdit className={'text-[14px]'} />
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </Popover>
  );

  return (
    <Select
      clickToHide={true}
      maxHeight={670}
      disabled
      className={classNames(styles['doc-selector'])}
      dropdownClassName={styles['doc-selector-dropdown']}
      optionList={handledOptions}
      value={value}
      onChange={onChange}
      getPopupContainer={() => document.body}
      triggerRender={triggerRender}
      innerTopSlot={
        <Search
          value={search}
          placeholder={I18n.t('datasets_placeholder_search')}
          onChange={v => {
            setSearch(v);
          }}
          onSearch={v => {
            logger.info({
              message: 'onSearch',
              meta: { v },
            });
            debounceSetSearch.run(v);
          }}
        />
      }
    />
  );
};
