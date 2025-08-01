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

import { CozAvatar } from '@coze-arch/coze-design';

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
