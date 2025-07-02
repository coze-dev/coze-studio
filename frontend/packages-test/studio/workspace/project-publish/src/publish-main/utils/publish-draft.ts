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
