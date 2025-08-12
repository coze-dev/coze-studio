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
import { get } from 'lodash-es';
import { getDataTypeText } from '@coze-data/utils';
import { getSrcFromImg } from '@coze-data/knowledge-modal-base';
import { KnowledgeE2e } from '@coze-data/e2e';
import {
  TextRender,
  ActionsRender,
  TagRender,
  ImageRender,
  type TableViewRecord,
  type TableViewColumns,
  colWidthCacheService,
} from '@coze-common/table-view';
import { I18n } from '@coze-arch/i18n';
import { Tag, Tooltip, Typography } from '@coze-arch/coze-design';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { ColumnType, SliceStatus } from '@coze-arch/bot-api/knowledge';

import { type TranSliceListParams } from '@/types/slice';

const MAX_WIDTH = 1400;
const MIN_WIDTH = 200;
const DIFF_WIDTH = 397;
const READONLY_DIFF_WIDTH = 259;

export function isNoMore(data, pageSize) {
  return Boolean(
    !data?.total || (data.nextPageIndex - 1) * pageSize >= data.total,
  );
}

export function isStop(res) {
  return res?.list?.length || res?.total;
}

const ColumnTypeComp = (props: { columnType: ColumnType }) => (
  <Tag color="primary" className="ml-[6px] text-xs" size="mini">
    {getDataTypeText(props.columnType)}
  </Tag>
);

const getTableCacheWidthMap = (tableKey: string) => {
  try {
    return colWidthCacheService.getTableWidthMap(tableKey) ?? {};
  } catch (e) {
    console.log('getTableCacheWidthMap error', e);
    return {};
  }
};

/**
 * Slice data to the data type received by the TableView component
 */

export const getTableRenderColumnsData = ({
  sliceList,
  metaData = [],
  onEdit,
  onUpdate,
  onDelete,
  canEdit,
  tableKey,
}: TranSliceListParams): {
  data: TableViewRecord[];
  columns: TableViewColumns[];
} => {
  try {
    const dom = document.getElementsByClassName(
      'knowledge-ide-base-slice-list-ui-content',
    )[0];
    const cacheWidthMap = getTableCacheWidthMap(tableKey);
    const maxWidth = dom
      ? (dom as HTMLElement).offsetWidth -
        (canEdit ? DIFF_WIDTH : READONLY_DIFF_WIDTH)
      : MAX_WIDTH;
    const res: TableViewRecord[] = sliceList.map(slice => {
      const { char_count, hit_count, status } = slice;
      const record = { char_count, hit_count, status };
      const sliceArr = safeJSONParse(slice.content);
      if (Array.isArray(sliceArr)) {
        sliceArr.forEach(sliceData => {
          record[sliceData.column_id] = sliceData.value;
        });
      }
      return record;
    });
    const dataWidth =
      maxWidth / metaData.length > MIN_WIDTH
        ? maxWidth / metaData.length
        : MIN_WIDTH;
    const columns: TableViewColumns[] = metaData.map((meta, columnIndex) => ({
      dataIndex: meta.id,
      title: (
        <div className="flex flex-row items-center">
          <Typography.Text
            className="cursor-pointer"
            ellipsis={{
              showTooltip: {
                opts: { content: meta.column_name },
              },
            }}
          >
            {meta.column_name}
          </Typography.Text>
          {meta.is_semantic ? (
            <Tag
              size="mini"
              color="green"
              className="ml-2"
              data-testid={KnowledgeE2e.TableLocalPreviewSemantic}
            >
              {I18n.t('knowledge_1226_001')}
            </Tag>
          ) : null}
          {meta.column_type ? (
            <ColumnTypeComp columnType={meta.column_type} />
          ) : null}
        </div>
      ),
      width: get(cacheWidthMap, meta.id || '') ?? dataWidth,
      render: (text, record, index) => {
        const isEditing =
          columnIndex === 0 &&
          index === sliceList.length - 1 &&
          !!sliceList[index].addId;
        if (meta.column_type === ColumnType.Image) {
          const srcList = getSrcFromImg(text);
          return (
            <ImageRender
              srcList={srcList}
              onChange={(src, tosKey) => {
                let val = '';
                if (src || tosKey) {
                  val = `<img src="${src ?? ''}" ${
                    tosKey ? `data-tos-key="${tosKey}"` : ''
                  }>`;
                }
                const newRecord = { ...record, [meta?.id as string]: val };
                onUpdate?.(newRecord, index);
              }}
            />
          );
        }
        // Highlighting violations
        const isAudiFailed = record?.status === SliceStatus.AuditFailed;
        const textRender = () => (
          <div className={`w-full ${isAudiFailed ? 'text-red-500' : ''}`}>
            <TextRender
              dataIndex={meta.id}
              value={text}
              record={record}
              index={index}
              isEditing={isEditing}
              editable={canEdit}
              validator={{
                validate: value => {
                  if (meta.is_semantic) {
                    return !value || value === '';
                  }
                  return false;
                },
                errorMsg: I18n.t('datasets_url_empty'),
              }}
              onBlur={async (_text, updateRecord) =>
                await onUpdate?.(updateRecord, index, _text as string)
              }
            />
          </div>
        );
        if (isAudiFailed) {
          return (
            <Tooltip
              content={I18n.t('knowledge_content_illegal_error_msg')}
              trigger="hover"
              position="top"
              getPopupContainer={() => document.body}
            >
              {textRender()}
            </Tooltip>
          );
        }
        return textRender();
      },
    }));
    columns.push({
      title: '',
      className: 'not-resize-handle data-tags',
      resize: false,
      render: (_text, record, _index) => {
        const { char_count, hit_count } = record;
        return (
          <div className="flex gap-3">
            <TagRender
              value={`${char_count ?? 0} ${I18n.t('datasets_segment_card_bit', {
                num: char_count ?? 0,
              })}`}
            />
            <TagRender
              value={I18n.t('datasets_segment_card_hit', {
                num: hit_count ?? 0,
              })}
            />
          </div>
        );
      },
    });
    if (canEdit) {
      columns.push({
        title: '',
        width: 100,
        className: 'not-resize-handle',
        resize: false,
        render: (_text, record, index) => (
          <ActionsRender
            record={record}
            index={index}
            editProps={{
              disabled: false,
              onEdit: () => {
                onEdit?.(record, index);
              },
            }}
            deleteProps={{
              disabled: false,
              onDelete: () => {
                onDelete?.([index]);
              },
            }}
          />
        ),
      });
    }
    columns.unshift({
      title: '',
      width: 68,
      fixed: true,
      resize: false,
      className: 'pl-0 text-sm not-resize-handle',
      render: (_text, _record, index) => (
        <div className="text-xs coz-fg-secondary">{index + 1}</div>
      ),
    });
    return {
      data: res,
      columns,
    };
  } catch (error) {
    console.log('transSliceList handler error', error);
    return {
      data: [],
      columns: [],
    };
  }
};
