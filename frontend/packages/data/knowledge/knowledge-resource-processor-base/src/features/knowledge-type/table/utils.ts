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
 
import { get } from 'lodash-es';
import { isFeishuOrLarkDocumentSource } from '@coze-data/utils';
import {
  FooterBtnStatus,
  UploadStatus,
} from '@coze-data/knowledge-resource-processor-core';
import type {
  UnitItem,
  OptType,
  ProgressItem,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';
import {
  type GetDocumentTableInfoResponse,
  type DocumentTaskInfo,
  type DocTableColumn,
  ColumnType,
} from '@coze-arch/bot-api/memory';
import {
  TableDataType,
  DocumentSource,
  type DocumentBase,
  type TableColumn,
  type UpdateRule,
} from '@coze-arch/bot-api/knowledge';
import { FormatType } from '@coze-arch/bot-api/developer_api';

import {
  useDocIdFromQuery,
  tableSettingsToString,
  validateField,
} from '@/utils';
import {
  type TableSettings,
  type TableInfo,
  type SemanticValidate,
  type AddCustomTableMeta,
} from '@/types';
import {
  TableStatus,
  MAX_TABLE_META_COLUMN_LEN,
  MAX_TABLE_META_STR_LEN,
  TableSettingFormFields,
} from '@/constants';

/**
 * 校验key是否能作为语义匹配项
 * @param data
 * @returns
 */
export const semanticValidator = (
  data?: GetDocumentTableInfoResponse,
  startRow = 0,
): SemanticValidate => {
  if (!data) {
    return {};
  }

  const { table_meta, preview_data } = data;

  if (
    !table_meta ||
    !preview_data ||
    !Object.keys(table_meta).length ||
    !Object.keys(preview_data).length
  ) {
    return {};
  }

  // TODO 下面forEach写的不好，待优化
  const res: SemanticValidate = {};
  Object.keys(table_meta).forEach(sheetId => {
    res[sheetId] = {};
    const curTableMeta = table_meta[sheetId];
    if (!Array.isArray(curTableMeta)) {
      return {};
    }

    curTableMeta.forEach(meta => {
      const { column_type, sequence } = meta;
      if (sequence === undefined) {
        return;
      }
      res[sheetId][sequence] = {
        valid: true,
        msg: '',
      };
      preview_data[sheetId].slice(startRow).forEach(dataMap => {
        if (column_type === ColumnType.Image) {
          res[sheetId][sequence] = {
            valid: false,
            msg: I18n.t('knowledge_insert_img_011'),
          };
          return;
        }
      });
    });
  });

  return res;
};

export function filterDocumentList({
  unitList,
  tableData,
  tableSettings,
  docIdFromQuery,
}: {
  unitList: UnitItem[];
  tableData: TableInfo;
  tableSettings: TableSettings;
  docIdFromQuery: string;
}): DocumentTaskInfo[] {
  const meta = tableData.table_meta?.[tableSettings.sheet_id];
  const { sheet_id, header_line_idx, start_line_idx } = tableSettings;
  const settings = {
    sheet_id: sheet_id.toString(),
    header_line_idx: header_line_idx.toString(),
    start_line_idx: start_line_idx.toString(),
  };
  return unitList.map(item => {
    if (item.docId) {
      return {
        name: item.name,
        uri: item.uri,
        document_id: item.docId,
        format_type: FormatType.Table,
        doc_table_meta: meta,
        doc_table_info: settings,
      };
    }
    return {
      name: item.name,
      uri: item.uri,
      document_id: docIdFromQuery === '' ? undefined : docIdFromQuery,
      format_type: FormatType.Table,
      doc_table_meta: meta,
      doc_table_info: settings,
    };
  }) as DocumentTaskInfo[];
}

export const useResegmentFetchTableParams = () => ({
  document_id: useDocIdFromQuery(),
  // source_file: {
  //   document_source: DocumentSource.Document,
  // },
  table_data_type: TableDataType.AllData,
});

export function isConfigurationLoading(status: TableStatus) {
  return status === TableStatus.LOADING;
}

export function isConfigurationError(status: TableStatus) {
  return status === TableStatus.ERROR;
}

export function isConfigurationShowBanner(
  opt: OptType,
  originTableData: TableInfo,
  tableSettings: TableSettings,
): boolean {
  return opt
    ? (
        get(
          originTableData,
          `table_meta.${tableSettings[TableSettingFormFields.SHEET]}`,
        ) || []
      ).length > MAX_TABLE_META_COLUMN_LEN
    : Object.keys(
        get(
          originTableData,
          `preview_data.${tableSettings[TableSettingFormFields.SHEET]}.${
            tableSettings[TableSettingFormFields.KEY_START_ROW]
          }`,
        ) || {},
      ).length > MAX_TABLE_META_COLUMN_LEN;
}

export function getConfigurationMeta(
  tableData: TableInfo,
  tableSettings: TableSettings,
) {
  return tableData
    ? (
        (tableData.table_meta || {})[
          tableSettings[TableSettingFormFields.SHEET] || 0
        ] || []
      ).map(_meta => ({
        ..._meta,
        key: _meta.id,
        column_name: (_meta.column_name ?? '').substring(
          0,
          MAX_TABLE_META_STR_LEN,
        ),
      }))
    : [];
}

export function getExpandConfigurationMeta(
  tableData: TableInfo,
  tableSettings: TableSettings,
  validResult: Record<string, string>,
): Array<
  DocTableColumn & {
    autofocus?: boolean;
    errMsg?: string;
  }
> {
  const tableColumn = getConfigurationMeta(tableData, tableSettings);
  const validResultKeys = Object.keys(validResult);
  return tableColumn.map(item => {
    const newItem: DocTableColumn & {
      autofocus?: boolean;
      errMsg?: string;
    } = {
      ...item,
    };
    const hasHit = validResultKeys.includes(item?.column_name || '');
    if (hasHit) {
      newItem.errMsg = validResult[item?.column_name || ''];
    }
    return newItem;
  });
}

export function getConfigurationNextStatus(
  tableData: TableInfo,
  tableSettings: TableSettings,
): FooterBtnStatus {
  if (!tableData) {
    return FooterBtnStatus.DISABLE;
  }
  const { table_meta } = tableData;
  const meta =
    get(table_meta, tableSettings[TableSettingFormFields.SHEET]) || [];
  const hasEmptyMeta = meta.some(v => (v.column_name ?? '') === '');
  const hasEmptyType = meta.some(v => !(v.column_type ?? ''));
  const hasSystemField = meta.some(
    v => validateField(v?.column_name ?? '')?.valid === false,
  );
  const hasSemantic = meta.some(v => v.is_semantic === true);
  const hasDuplicateColumnName = meta.some(
    v => meta.filter(i => i.column_name === v.column_name).length >= 2,
  );
  // 没有表结构数据禁止下一步
  if (
    !Object.keys(meta).length ||
    hasEmptyMeta ||
    hasEmptyType ||
    !hasSemantic ||
    hasSystemField ||
    meta.length > MAX_TABLE_META_COLUMN_LEN ||
    hasDuplicateColumnName
  ) {
    return FooterBtnStatus.DISABLE;
  }
  return FooterBtnStatus.ENABLE;
}

export function getDocIdFromProgressList(progressList: ProgressItem[]) {
  return Array.isArray(progressList) && progressList.length > 0
    ? get(progressList, '0.documentId')
    : null;
}

/**
 * 获取footer状态，不包括loading状态，仅判断启/禁用
 * 满足以下任一情况时，禁用footer按钮
 * 1.存在列名为空
 * 2.unitName为空
 * 3.没有选择语义匹配项
 * @param metaData
 * @param unitName // TODO unitName的判断待删
 * @returns
 */
export const getCustomStatus = (
  metaData: AddCustomTableMeta,
  unitName: string,
): FooterBtnStatus => {
  const isDisabled =
    metaData.some(meta => !meta.column_type) ||
    !validateField(unitName)?.valid || // TODO 这一行待删
    !metaData.some(meta => meta.is_semantic === true) ||
    metaData.some(v => validateField(v.column_name ?? '')?.valid === false);
  return isDisabled ? FooterBtnStatus.DISABLE : FooterBtnStatus.ENABLE;
};

// table上传第一步footer状态判断
export function getButtonStatus(unitList: UnitItem[]) {
  const valid = unitList.some(v => validateField(v.name)?.valid === false);
  if (
    unitList.length === 0 ||
    valid ||
    unitList.some(
      unitItem =>
        unitItem.name.length === 0 || unitItem.status !== UploadStatus.SUCCESS,
    )
  ) {
    return FooterBtnStatus.DISABLE;
  }
  return FooterBtnStatus.ENABLE;
}

export function getAddSegmentParams({
  spaceId,
  docId,
  datasetId,
  documentInfo,
}: {
  spaceId?: string;
  docId?: string;
  datasetId: string;
  documentInfo: DocumentBase[];
}) {
  const payload = {
    space_id: spaceId, // 兼容旧接口
    document_id: docId, // 兼容旧接口
    dataset_id: datasetId,
    format_type: FormatType.Table,
    document_bases: documentInfo,
    is_append: true,
  };
  return payload;
}

export function getCreateDocumentParams({
  isAppend,
  unitList,
  metaData,
  tableSettings,
  sourceType,
  updateRule,
}: {
  isAppend: boolean;
  unitList: UnitItem[];
  metaData: TableColumn[];
  tableSettings: TableSettings;
  sourceType?: DocumentSource;
  updateRule?: UpdateRule;
}) {
  const documentSource = sourceType ?? DocumentSource.Document;
  const getSourceFileId = (unit: UnitItem) =>
    [DocumentSource.GoogleDrive, DocumentSource.Notion].includes(documentSource)
      ? unit.file_id
      : unit.entity_id;

  const getUpdateRule = () => {
    if (updateRule) {
      return updateRule;
    }

    if (
      !isAppend &&
      (documentSource === DocumentSource.Web ||
        isFeishuOrLarkDocumentSource(documentSource))
    ) {
      return {
        update_interval: get(unitList, '0.updateInterval'),
        update_type: get(unitList, '0.updateType'),
      };
    }
  };

  return {
    source_type: documentSource,
    format_type: FormatType.Table,
    document_bases: unitList.map(unit => ({
      name: '',
      source_info: {
        tos_uri: unit.uri,
        document_source: documentSource,
        source_file_id: getSourceFileId(unit),
        web_id: unit.webID as string,
      },
      update_rule: getUpdateRule(),
      table_sheet: tableSettingsToString(tableSettings),
      table_meta: metaData.map(meta => ({
        id: isAppend ? meta.id : '0', // 不是追加，默认是新建（为'0'）
        column_name: meta.column_name,
        is_semantic: meta.is_semantic,
        column_type: meta.column_type,
        desc: meta.desc,
        sequence: meta.sequence,
      })),
    })),

    is_append: isAppend,
    // document_id: useDocIdFromQuery() ?? undefined, // TODO 待删除，这里是为了兼容原来的MemoryApi.ProcessDocumentsTask更新逻辑
  };
}
