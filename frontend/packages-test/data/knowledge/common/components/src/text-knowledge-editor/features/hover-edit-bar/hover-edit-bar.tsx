import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { IconButton, Space, Tooltip } from '@coze-arch/coze-design';
import { SliceStatus } from '@coze-arch/bot-api/knowledge';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { type HoverEditBarActionRegistry } from '@/text-knowledge-editor/features/hover-edit-bar-actions/registry';
export interface HoverEditBarProps {
  chunk: Chunk;
  chunks: Chunk[];
  disabled?: boolean;
  hoverEditBarActionsRegistry: HoverEditBarActionRegistry;
  onChunksChange?: (chunks: Chunk[]) => void;
}

export const HoverEditBar: React.FC<HoverEditBarProps> = ({
  chunk,
  chunks,
  disabled,
  hoverEditBarActionsRegistry,
  onChunksChange,
}) => {
  const isAudiFailed = chunk.status === SliceStatus.AuditFailed;
  const iconButtonCommonClasses = 'coz-fg-secondary leading-none !w-6 !h-6';

  if (!hoverEditBarActionsRegistry) {
    return null;
  }

  return (
    <div className="absolute top-[2px] right-[2px] flex z-10">
      {!disabled ? (
        <div
          className={classNames(
            'p-1 coz-bg-plus rounded-lg',
            'coz-shadow-default',
          )}
        >
          <Space spacing={3}>
            {hoverEditBarActionsRegistry
              .entries()
              .map(([key, { Component }]) => (
                <Component
                  key={key}
                  chunk={chunk}
                  chunks={chunks}
                  onChunksChange={onChunksChange}
                />
              ))}
          </Space>
        </div>
      ) : null}

      {isAudiFailed ? (
        <div
          className={classNames(
            'p-1 coz-bg-plus rounded-lg',
            'coz-shadow-default',
            'ml-1',
          )}
        >
          <Tooltip
            content={I18n.t('community_This_is_a_toast_Machine_review_failed')}
            clickToHide
            autoAdjustOverflow
          >
            <IconButton
              icon={
                <IconCozInfoCircle className="text-[14px] coz-fg-hglt-red" />
              }
              size="small"
              color="secondary"
              className={iconButtonCommonClasses}
            />
          </Tooltip>
        </div>
      ) : null}
    </div>
  );
};
