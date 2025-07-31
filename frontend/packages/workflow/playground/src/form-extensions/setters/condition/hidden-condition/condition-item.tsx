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

import { type FC } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { useVariableTypeChange } from '@coze-workflow/variable';

import { type ConditionItem } from '../multi-condition/types';
interface HiddenConditionItemProps {
  data: ConditionItem;
  onDataChange: (data: ConditionItem) => void;
}

export const HiddenConditionItem: FC<HiddenConditionItemProps> = props => {
  const { data, onDataChange } = props;
  const doc = useService<WorkflowDocument>(WorkflowDocument);

  // Monitor changes in linkage variables to re-trigger the effect
  useVariableTypeChange({
    keyPath: data.left?.content?.keyPath,
    onTypeChange: ({ variableMeta }) => {
      // When the HACK historical version is loaded into the draft (loading into the draft operation, the canvas reload method is adjusted, resulting in a side effect being triggered), the UI linkage is not triggered
      if (doc.loading) {
        return;
      }

      if (!variableMeta) {
        // Variables have been deleted
        onDataChange?.({});
        return;
      }

      onDataChange?.({
        left: data.left,
      });
    },
  });

  return null;
};
