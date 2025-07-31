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

import React, { type FC } from 'react';

import classnames from 'classnames';

import { VariableTagList } from '../../fields/variable-tag-list';
import { type VariableMergeGroup } from './types';

interface VariableMergeItemProps {
  mergeGroup: VariableMergeGroup;
  index: number;
}

/**
 * variable merge
 */
export const VariableMergeItem: FC<VariableMergeItemProps> = ({
  mergeGroup,
  index,
}) => {
  const cls = index !== 0 ? 'mt-[6px]' : '';
  return (
    <>
      <div
        className={classnames(
          'w-[69px] h-5 leading-5 truncate coz-fg-dim font-medium text-xs pr-0.5',
          cls,
        )}
      >
        {mergeGroup.name}
      </div>
      <div className={classnames('space-y-2', cls)}>
        {mergeGroup.type ? <VariableTagList value={[mergeGroup]} /> : null}
        <VariableTagList value={mergeGroup.variableTags} maxTagWidth={120} />
      </div>
    </>
  );
};
