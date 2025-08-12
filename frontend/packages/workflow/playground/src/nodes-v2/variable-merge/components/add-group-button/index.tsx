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
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { type FieldArrayRenderProps } from '@flowgram-adapter/free-layout-editor';

import { TooltipWithDisabled } from '../tooltip-with-disabled';
import { generateGroupName } from '../../utils/generate-group-name';
import { type MergeGroup } from '../../types';
import { MAX_GROUP_COUNT } from '../../constants';

interface Props {
  mergeGroupsField: FieldArrayRenderProps<MergeGroup>['field'];
  readonly?: boolean;
}

/**
 * Add group button
 * @param param0
 * @returns
 */
export const AddGroupButton: FC<Props> = ({ mergeGroupsField, readonly }) => {
  if (readonly) {
    return null;
  }

  const disabled = (mergeGroupsField.value || []).length >= MAX_GROUP_COUNT;
  return (
    <TooltipWithDisabled
      content={I18n.t('workflow_var_merge_number_max')}
      disabled={!disabled}
    >
      <div
        onClick={() => {
          if (disabled) {
            return;
          }
          mergeGroupsField.append({
            name: generateGroupName(mergeGroupsField.value),
            variables: [],
          });
        }}
        className={classnames(
          'flex justify-center items-center gap-1 w-full h-8 rounded-[8px] select-none bg-[var(--coz-mg-hglt)] hover:bg-[var(--coz-mg-hglt-hovered)]',
          disabled
            ? 'cursor-not-allowed  text-[var(--coz-fg-hglt-dim)]'
            : 'cursor-pointer text-[var(--coz-fg-hglt)]',
        )}
      >
        <div className="flex items-center justify-center">
          <IconCozPlus />
        </div>
        <p className="text-[14px] font-medium text-nowrap">
          {I18n.t('workflow_var_merge_addGroup')}
        </p>
      </div>
    </TooltipWithDisabled>
  );
};
