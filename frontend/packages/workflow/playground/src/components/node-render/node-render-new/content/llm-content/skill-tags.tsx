import React from 'react';

import { CozAvatar } from '@coze/coze-design';

import { OverflowTagList } from '../../fields/overflow-tag-list';

export interface SkillTag {
  icon?: string;
  label?: string;
}

export const SkillTags: React.FC<{ skillTags: SkillTag[] }> = ({
  skillTags = [],
}) => {
  const renderTag = ({ icon, label }: SkillTag) => (
    <div className="flex items-center leading-[20px]">
      {icon ? (
        <CozAvatar
          size={'mini'}
          shape="square"
          src={icon}
          className={'shrink-0 h-4 w-4 mr-1'}
        />
      ) : null}

      <span className="truncate">{label}</span>
    </div>
  );

  return (
    <OverflowTagList<SkillTag>
      value={skillTags}
      enableTooltip
      tagItemRenderer={renderTag}
    />
  );
};
