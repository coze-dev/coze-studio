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

import { type WorkflowJSON } from '../../types';
import { type NodeResult } from '../../api';
import {
  type NodeResultExtracted,
  type NodeResultExtractorParser,
} from './type';
import { defaultParser } from './parsers';
export { type NodeResultExtracted, type CaseResultData } from './type';
export class NodeResultExtractor {
  private readonly parser: NodeResultExtractorParser;
  public constructor(
    private readonly nodeResults: NodeResult[],
    private readonly workflowSchema: WorkflowJSON,
  ) {
    this.parser = defaultParser;
  }

  public extract(): NodeResultExtracted[] {
    return (
      this.nodeResults
        ?.filter(Boolean)
        ?.map(item => this.parser(item, this.workflowSchema)) || []
    );
  }
}
