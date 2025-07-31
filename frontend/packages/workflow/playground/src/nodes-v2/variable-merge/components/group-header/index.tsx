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

import {
  type FieldRenderProps,
  type FieldArrayRenderProps,
  type FieldError,
} from '@flowgram-adapter/free-layout-editor';

import { InfoIcon } from '../info-icon';
import { GroupTypeTag } from '../group-type-tag';
import { DeleteGroupButton } from '../delete-group-button';
import { type MergeGroup } from '../../types';
import { FormItemFeedback } from '../../../components/form-item-feedback';
import { useEditName } from './use-edit-name';
import { GroupName } from './group-name';

interface Props {
  nameField: FieldRenderProps<string>['field'];
  nameFieldErrors: FieldError[];
  tooltip: string;
  mergeGroupsField: FieldArrayRenderProps<MergeGroup>['field'];
  mergeGroupField: FieldRenderProps<MergeGroup>['field'];
  index: number;
  mergeGroup: MergeGroup;
  readonly?: boolean;
}

/**
 * Packet header
 * @param param0
 * @returns
 */
export const GroupHeader: FC<Props> = ({
  nameField,
  nameFieldErrors,
  tooltip,
  mergeGroupsField,
  mergeGroupField,
  mergeGroup,
  index,
  readonly,
}) => {
  const { editName, handleChange, handleBlur, editErrors } = useEditName({
    nameField,
    mergeGroupField,
    mergeGroupsField,
  });

  return (
    <>
      <div className="w-full flex items-center h-6">
        <div className="flex-1 overflow-hidden pr-6">
          <div className="w-full flex items-center gap-1">
            <GroupName
              value={editName}
              readonly={readonly}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <GroupTypeTag mergeGroup={mergeGroup} />
            {mergeGroup?.variables?.length ? (
              <InfoIcon tooltip={tooltip} />
            ) : null}
          </div>
        </div>
        <DeleteGroupButton
          mergeGroupsField={mergeGroupsField}
          index={index}
          readonly={readonly}
        />
      </div>
      {editErrors.length || nameFieldErrors.length ? (
        <FormItemFeedback
          errors={editErrors.length ? editErrors : nameFieldErrors}
        />
      ) : null}
    </>
  );
};
