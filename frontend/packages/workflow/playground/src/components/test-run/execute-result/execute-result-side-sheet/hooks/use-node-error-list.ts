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

/* eslint-disable @coze-arch/no-deep-relative-import */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useExecStateEntity } from '../../../../../hooks';
import { type NodeError } from '../../../../../entities/workflow-exec-state-entity';

export const useNodeErrorList = () => {
  const { nodeErrors } = useExecStateEntity();

  const nodeErrorList = Object.keys(nodeErrors).reduce(
    (list, nodeId: string) => {
      const nodeError = nodeErrors[nodeId].filter(
        item => item.errorType === 'node',
      );

      const errors = nodeError.filter(item => item.errorLevel === 'error');
      const warnings = nodeError.filter(item => item.errorLevel === 'warning');

      const results = errors.length > 0 ? errors : warnings;
      if (results.length > 0) {
        return [
          ...list,
          {
            nodeId,
            errorInfo: results.map(error => error.errorInfo).join(';'),
            errorLevel: results[0].errorLevel,
            errorType: 'node',
          } as NodeError,
        ];
      }

      return list;
    },
    [] as NodeError[],
  );

  return {
    nodeErrorList,
    hasNodeError: nodeErrorList.length > 0,
  };
};
