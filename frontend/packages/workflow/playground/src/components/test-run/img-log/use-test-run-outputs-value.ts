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

import { NodeExeStatus } from '@coze-arch/idl/workflow_api';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';

import { useTestRunResult } from './use-test-run-result';

interface BatchItem {
  output: string;
}

type Batch = BatchItem[];

// Get node debug output
export function useTestRunOutputsValue() {
  let outputsValue;
  const testRunResult = useTestRunResult();

  if (testRunResult?.nodeStatus !== NodeExeStatus.Success) {
    return;
  }

  // batch mode
  if (testRunResult?.batch) {
    const batch = typeSafeJSONParse(testRunResult.batch) as Batch;
    const outputList = batch.map(item => typeSafeJSONParse(item.output));

    outputsValue = {
      outputList,
    };
  } else {
    const log =
      testRunResult?.NodeType === 'End' || testRunResult?.NodeType === 'Message'
        ? testRunResult?.input
        : testRunResult?.output || '';

    outputsValue = typeSafeJSONParse(log);
  }

  return outputsValue;
}
