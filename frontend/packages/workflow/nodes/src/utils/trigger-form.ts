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

/**
 * Why maintain triggerId so much?
 * The new process fetchStartNodeTriggerFormValue without triggerId, after the initial save, the backend returns triggerId
 * The saved process, when fetchStartNodeTriggerFormValue, will return triggerId
 * The acquisition time is different, and it is more troublesome to hard-plug the triggerId into formData, so it is directly maintained in the cacheTriggerId.
 */
const cacheTriggerId: Record<string, string> = {};
export const setTriggerId = (wfId: string, triggerId: string) => {
  cacheTriggerId[wfId] = triggerId;
};

export const getTriggerId = (wfId: string) => cacheTriggerId[wfId];
