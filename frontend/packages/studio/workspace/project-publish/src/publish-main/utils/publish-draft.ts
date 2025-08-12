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

import { type ConnectorPublishConfig } from '@coze-arch/idl/intelligence_api';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';

export const PUBLISH_DRAFT_KEY = 'coz_project_publish_draft';

export interface ProjectPublishDraft {
  projectId: string;
  versionNumber: string;
  versionDescription: string;
  selectedConnectorIds: string[];
  unions: Record<string, string>;
  sdkConfig?: ConnectorPublishConfig;
  socialPlatformConfig?: ConnectorPublishConfig;
}

export function loadProjectPublishDraft(projectId: string) {
  const str = localStorage.getItem(PUBLISH_DRAFT_KEY);
  localStorage.removeItem(PUBLISH_DRAFT_KEY);
  if (!str) {
    return undefined;
  }
  const draft = typeSafeJSONParse(str) as ProjectPublishDraft | undefined;
  if (draft?.projectId === projectId) {
    return draft;
  }
  return undefined;
}

export function saveProjectPublishDraft(draft: ProjectPublishDraft) {
  localStorage.setItem(PUBLISH_DRAFT_KEY, JSON.stringify(draft));
}
