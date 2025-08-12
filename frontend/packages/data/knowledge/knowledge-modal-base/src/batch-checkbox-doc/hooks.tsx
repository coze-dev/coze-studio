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

import { useEffect, useMemo, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  Checkbox,
  CheckboxGroup,
  Tag,
  Typography,
} from '@coze-arch/coze-design';
import {
  DocumentSource,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';
/* eslint-disable no-restricted-imports */
import { getUpdateIntervalOptions } from '@coze-data/utils';
import { KnowledgeE2e } from '@coze-data/e2e';
import { type CheckboxEvent } from '@douyinfe/semi-ui/lib/es/checkbox';

import { ICON_MAP } from './const';

import styles from './index.module.less';

export interface IBatchCheckboxDocProps {
  documentList: DocumentInfo[];
  showTag?: boolean;
  disabled?: boolean;
}

export const useBatchCheckboxDoc = (props: IBatchCheckboxDocProps) => {
  const { documentList, showTag = false, disabled = false } = props;
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);

  const checkboxOptions = useMemo(
    () =>
      documentList?.filter(
        item =>
          ![DocumentSource.Custom, DocumentSource.Document].includes(
            item?.source_type as DocumentSource,
          ),
      ),
    [documentList],
  );
  const plainOptions: string[] = useMemo(() => {
    if (disabled) {
      return ((checkboxOptions?.filter(item => !item.is_disconnect) || [])?.map(
        doc => doc.document_id,
      ) || []) as string[];
    }
    return (checkboxOptions?.map(v => v.document_id) ?? []) as string[];
  }, [checkboxOptions, disabled]);
  // Initialize all selections
  const initCheckedList = () => {
    setCheckedList(plainOptions);
    setCheckAll(plainOptions?.length > 0);
  };
  useEffect(() => {
    initCheckedList();
  }, [documentList]);
  const onCheckAllChange = (e: CheckboxEvent) => {
    console.log(e);
    setCheckedList(e?.target?.checked ? plainOptions : []);
    setIndeterminate(false);
    setCheckAll(e?.target?.checked ?? false);
  };
  const onChange = (list: string[]) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < plainOptions.length);
    setCheckAll(list.length === plainOptions.length);
  };
  const UpdateIntervalOptions = getUpdateIntervalOptions();
  return {
    node: (
      <div className={styles['batch-checkbox-doc']}>
        <div className={styles['batch-checkbox-doc-title']}>
          <div
            className="flex items-center height-[20px]"
            data-testid={
              KnowledgeE2e.SegmentDetailBatchFrequencyModalcheckboxAll
            }
          >
            <Checkbox
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              <div className={styles['checked-all-title']}>
                {I18n.t('knowledge_optimize_010')}
              </div>
            </Checkbox>
          </div>
        </div>
        <div className={styles['batch-checkbox-doc-list']}>
          <CheckboxGroup value={checkedList} onChange={onChange}>
            {checkboxOptions?.map(item => (
              <div
                className={styles['batch-checkbox-doc-list-item']}
                data-dtestid={`${KnowledgeE2e.SegmentDetailBatchFrequencyModalcheckboxItem}.${item.name}`}
              >
                <Checkbox
                  disabled={disabled && item.is_disconnect}
                  value={item.document_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div className={styles['batch-checkbox-doc-list-item-left']}>
                    {ICON_MAP[item?.source_type ?? DocumentSource.Web]}
                    <Typography.Text
                      className={
                        styles['batch-checkbox-doc-list-item-left-label']
                      }
                      ellipsis={{
                        showTooltip: {
                          opts: { content: item.name },
                        },
                      }}
                      style={{
                        width: 270,
                      }}
                    >
                      {item.name}
                    </Typography.Text>

                    {disabled && item.is_disconnect ? (
                      <Tag size="small" color="primary">
                        {I18n.t('knowledge_optimize_099')}
                      </Tag>
                    ) : null}
                  </div>
                </Checkbox>

                {showTag &&
                UpdateIntervalOptions?.find(
                  v => v.value === item.update_interval,
                )?.label ? (
                  <Tag size="small" color="primary">
                    {
                      UpdateIntervalOptions?.find(
                        v => v.value === item.update_interval,
                      )?.label
                    }
                  </Tag>
                ) : null}
              </div>
            ))}
          </CheckboxGroup>
        </div>
      </div>
    ),
    checkedList,
    initCheckedList,
  };
};
