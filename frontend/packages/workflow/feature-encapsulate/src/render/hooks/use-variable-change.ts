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

import { useEffect, useState } from 'react';

import { FlowNodeVariableData } from '@coze-workflow/variable';

export const useVariableChange = nodes => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const disposables = nodes
      .filter(node => node.getData(FlowNodeVariableData)?.public?.available)
      .map(node =>
        node.getData(FlowNodeVariableData).public.available.onDataChange(() => {
          setVersion(version + 1);
        }),
      );
    return () => {
      disposables.forEach(disposable => disposable?.dispose());
    };
  }, [nodes, version]);

  return {
    version,
  };
};
