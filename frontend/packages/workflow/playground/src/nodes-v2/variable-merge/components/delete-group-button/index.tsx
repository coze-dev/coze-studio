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

import { I18n } from '@coze-arch/i18n';
import { IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';
import { type FieldArrayRenderProps } from '@flowgram-adapter/free-layout-editor';

import { TooltipWithDisabled } from '../tooltip-with-disabled';
import { type MergeGroup } from '../../types';

interface Props {
  mergeGroupsField: FieldArrayRenderProps<MergeGroup>['field'];
  index: number;
  readonly?: boolean;
}

/**
 * Delete group button
 * @param param0
 * @returns
 */
export const DeleteGroupButton: FC<Props> = ({
  mergeGroupsField,
  index,
  readonly,
}) => {
  const canDelete = (mergeGroupsField.value || []).length > 1;

  return (
    <TooltipWithDisabled
      content={I18n.t('workflow_var_merge_delete_limit')}
      disabled={canDelete}
    >
      <IconButton
        style={{ position: 'relative', top: '-1px' }}
        size="small"
        disabled={readonly || !canDelete}
        color="secondary"
        onClick={() => {
          mergeGroupsField.delete(index);
        }}
        icon={<IconCozMinus className="text-lg" />}
      ></IconButton>
    </TooltipWithDisabled>
  );
};
