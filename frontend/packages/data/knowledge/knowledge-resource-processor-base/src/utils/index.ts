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

export {
  getFrequencyMap,
  IValidateRes,
  validateField,
  tableSettingsToString,
} from './table';
export {
  transformUnitList,
  reportFailGetProgress,
  isStopPolling,
  clearPolling,
  useOptFromQuery,
  useDocIdFromQuery,
  getFileExtension,
  getBase64,
  getUint8Array,
  reportProcessDocumentFail,
  getProcessingDescMsg,
  isThirdResegment,
  isIncremental,
} from './common';

export { getSegmentCleanerParams } from './text';

export { getStorageStrategyEnabled } from './get-storage-strategy-enabled';

export { validateCommonDocResegmentStep } from './validate-common-doc-next-step';
