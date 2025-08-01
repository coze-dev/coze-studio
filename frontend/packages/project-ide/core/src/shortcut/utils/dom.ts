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

export const domEditable = (dom: HTMLElement) => {
  const editableContent = dom.closest('div[contentEditable=true]');
  if (editableContent) {
    return true;
  }
  if (dom.contentEditable === 'true') {
    return true;
  }
  if (dom.tagName === 'INPUT' || dom.tagName === 'TEXTAREA') {
    return true;
  }
  return false;
};
