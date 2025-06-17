// TagList.tsx
import React, { useState } from 'react';

import copy from 'copy-to-clipboard';
import { I18n } from '@coze-arch/i18n';
import { Tooltip, Toast } from '@coze-arch/coze-design';
import { UITag } from '@coze-arch/bot-semi';
import { IconChevronDown } from '@coze-arch/bot-icons';

import styles from './index.module.less';

interface TagListProps {
  className?: string;
  tags: string[];
  max: number;
}

export const TagList: React.FC<TagListProps> = ({
  className = '',
  tags,
  max,
}) => {
  const [expanded, setExpanded] = useState(false);
  const showMoreCount = tags.length > max && !expanded;
  const tagsNeedShow = expanded ? tags : tags.slice(0, max);
  const restTags = tags.length - max;

  return (
    <div className={`${styles.container} ${className}`}>
      {tagsNeedShow.map((tag, idx) => (
        <Tooltip content={I18n.t('database_240522_01')}>
          <UITag
            onClick={() => {
              copy(tag);
              Toast.success(I18n.t('database_240522_02'));
            }}
            key={idx}
          >
            {tag}
          </UITag>
        </Tooltip>
      ))}
      {showMoreCount ? (
        <UITag onClick={() => setExpanded(true)}>+{restTags}</UITag>
      ) : null}
      {expanded ? (
        <UITag onClick={() => setExpanded(false)}>
          <IconChevronDown rotate={180} />
        </UITag>
      ) : null}
    </div>
  );
};

export default TagList;
