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

import { type UnitItem } from '@coze-data/knowledge-resource-processor-core';
import { useEditUnitNameModal } from '@coze-data/knowledge-modal-base';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozEdit,
  IconCozRefresh,
  IconCozTrashCan,
} from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { type RenderColumnsProps } from '../types';
import { getFrequencyMap } from '../../../utils';

export function getFileSizeInfo(record: UnitItem) {
  return (
    <div
      data-dtestid={`${KnowledgeE2e.LocalUploadListFileSize}.${record.name}`}
      className={'coz-fg-secondary text-12px'}
    >
      {record?.size}
    </div>
  );
}

export function getFrequencyInfo(record: UnitItem) {
  return (
    <div
      data-dtestid={`${KnowledgeE2e.LocalUploadListFrequency}.${record.name}`}
      className={'coz-fg-secondary text-12px'}
    >
      {getFrequencyMap(record.updateInterval || 0)}
    </div>
  );
}

export function ActionRenderByDelete(props: RenderColumnsProps) {
  const { index, record, params } = props;
  const { onChange, unitList, onDelete } = params;

  const handleDelete = () => {
    onChange(unitList.filter((u, i) => index !== i));
    if (typeof onDelete === 'function') {
      onDelete?.(record, index);
    }
  };
  return (
    <Tooltip spacing={12} content={I18n.t('Delete')} position="top">
      <IconButton
        color="secondary"
        icon={<IconCozTrashCan className="text-14px" />}
        iconPosition="left"
        size="small"
        onClick={handleDelete}
      ></IconButton>
    </Tooltip>
  );
}

export function ActionRenderByEditName(props: RenderColumnsProps) {
  const { index, record, params } = props;
  const { onChange, unitList } = params;

  const { node, open } = useEditUnitNameModal({
    name: record?.name ?? '',
    onOk: (name: string) => {
      const arr = [...unitList];
      arr[index].name = name;
      onChange(arr);
    },
  });
  return (
    <>
      <Tooltip spacing={12} content={I18n.t('Edit')} position="top">
        <IconButton
          color="secondary"
          icon={<IconCozEdit className="text-14px" />}
          iconPosition="left"
          size="small"
          onClick={() => open()}
        />
      </Tooltip>
      {node}
    </>
  );
}

export function ActionRenderByRetry(props: RenderColumnsProps) {
  const { index, record, params } = props;
  if (params.disableRetry) {
    return null;
  }
  const { onRetry } = params;

  const handleRetry = () => {
    onRetry?.(record, index);
  };
  return (
    <Tooltip
      spacing={12}
      content={I18n.t('datasets_unit_update_retry')}
      position="top"
    >
      <IconButton
        color="secondary"
        icon={<IconCozRefresh className="text-14px" />}
        iconPosition="left"
        size="small"
        onClick={handleRetry}
      ></IconButton>
    </Tooltip>
  );
}
