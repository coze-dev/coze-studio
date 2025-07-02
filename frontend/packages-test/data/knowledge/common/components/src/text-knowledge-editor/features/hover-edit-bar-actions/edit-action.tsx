import React from 'react';

import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozEdit } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { eventBus } from '@/text-knowledge-editor/event';

import { type HoverEditBarActionProps } from './module';

/**
 * 编辑操作组件
 *
 * 内部实现了激活特定分片的编辑模式的逻辑
 * 如果传入了 onEdit 回调，则会在点击时调用
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
