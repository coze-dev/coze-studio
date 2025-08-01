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

export { arrayBufferToObject } from './array-buffer-to-object';

export { isMobile } from './is-mobile';
export { safeJSONParse, typeSafeJSONParse } from './safe-json-parse';
export { type BytedUploader, upLoadFile } from './upload-file';
export { messageReportEvent, type MessageReportEvent } from './message-report';
export { ArrayUtil } from './array';
export { skillKeyToApiStatusKeyTransformer } from './skill';
export { loadImage } from './image';
export { renderHtmlTitle } from './html';
export { getParamsFromQuery, appendUrlParam, openUrl } from './url';
export { responsiveTableColumn } from './responsive-table-column';
export {
  getFormatDateType,
  formatDate,
  getCurrentTZ,
  getTimestampByAdd,
  getCurrentTimestamp,
  formatTimestamp,
} from './date';
export {
  simpleformatNumber,
  formatBytes,
  formatNumber,
  formatPercent,
  formatTime,
  getEllipsisCount,
  exhaustiveCheck,
  sleep,
} from './number';

export {
  uploadFileV2,
  type EventPayloadMaps,
  type UploaderInstance,
  type UploadFileV2Param,
  type FileItem,
} from './upload-file-v2';
export { retryImport } from './retry-import';

export {
  BufferedEventEmitter,
  OpenBlockEvent,
  OpenModalEvent,
  EmitEventType,
  emitEvent,
  handleEvent,
  removeEvent,
  DraftEvent,
  draftEventEmitter,
} from './event-handler';
export { setMobileBody, setPCBody } from './viewport';
/** Get device information */
export {
  getIsIPhoneOrIPad,
  getIsIPad,
  getIsMobile,
  getIsMobileOrIPad,
  getIsSafari,
} from './platform';
export { closestScrollableElement, openNewWindow } from './dom';

export const timeoutPromise = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export { getCache, setCache, clearCache } from './cache';
