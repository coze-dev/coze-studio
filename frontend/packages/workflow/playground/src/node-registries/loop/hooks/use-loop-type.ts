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

import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { useEffect, useLayoutEffect, useState } from 'react';
import { LoopPath, LoopType } from '../constants';

export const useLoopType = () => {
  const [loopType, setLoopType] = useState<LoopType | undefined>();

  const node = useCurrentEntity();
  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const getLoopType = () =>
    formModel.getValueIn<LoopType>(LoopPath.LoopType) ?? LoopType.Array;

  // Synchronized form value initialization
  useLayoutEffect(() => {
    setLoopType(getLoopType());
  }, [formModel]);

  // Synchronize form external value changes: undo/redo/synergy
  useEffect(() => {
    const disposer = formModel.onFormValuesChange(({ name }) => {
      if (name !== LoopPath.LoopType) {
        return;
      }
      setLoopType(getLoopType());
    });
    return () => disposer.dispose();
  }, [formModel]);

  return loopType;
};
