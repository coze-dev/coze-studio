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

/* eslint-disable  @typescript-eslint/naming-convention*/
/* eslint-disable @typescript-eslint/no-shadow */

export const BatchSize = {
  width: 360,
  height: 139.86,
};

export const BatchFunctionSize = {
  width: BatchSize.width,
  height: (BatchSize.width * 3) / 5,
};

export const BatchOutputsSuffix = '_list';

export enum BatchPath {
  ConcurrentSize = 'inputs.concurrentSize',
  BatchSize = 'inputs.batchSize',
  Inputs = 'inputs.inputParameters',
  Outputs = 'outputs',
}
