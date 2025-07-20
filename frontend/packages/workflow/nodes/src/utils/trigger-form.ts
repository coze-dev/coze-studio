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
 * 为什么要这么维护 triggerId？
 * 新的流程 fetchStartNodeTriggerFormValue 时没有 triggerId ，初次保存后，后端返回 triggerId
 * 已经保存过的流程, fetchStartNodeTriggerFormValue 时，会返回 triggerId
 * 获取时机不同，把 triggerId 硬塞到 formData 中比较麻烦，所以直接维护在 cacheTriggerId 中
 */
const cacheTriggerId: Record<string, string> = {};
export const setTriggerId = (wfId: string, triggerId: string) => {
  cacheTriggerId[wfId] = triggerId;
};

export const getTriggerId = (wfId: string) => cacheTriggerId[wfId];
