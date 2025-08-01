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

import React from 'react';

import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozEdit } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { eventBus } from '@/text-knowledge-editor/event';

import { type HoverEditBarActionProps } from './module';

/**
 * Edit action component
 *
 * The logic to activate the edit mode for specific shardings is implemented internally
 * If an onEdit callback is passed, it will be called on click
 */
export const EditAction: React.FC<HoverEditBarActionProps> = ({
  chunk,
  disabled,
}) => (
  <Tooltip
    content={I18n.t('datasets_segment_edit')}
    clickToHide
    autoAdjustOverflow
  >
    <IconButton
      data-dtestid={`${KnowledgeE2e.SegmentDetailContentItemEditIcon}.${chunk.text_knowledge_editor_chunk_uuid}`}
      size="small"
      color="secondary"
      disabled={disabled}
      icon={<IconCozEdit className="text-[14px]" />}
      iconPosition="left"
      className="coz-fg-secondary leading-none !w-6 !h-6"
      onClick={() => {
        eventBus.emit('hoverEditBarAction', {
          type: 'edit',
          targetChunk: chunk,
        });
      }}
    />
  </Tooltip>
);
