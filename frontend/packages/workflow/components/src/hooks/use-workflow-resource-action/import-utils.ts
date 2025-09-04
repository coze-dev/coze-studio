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

import { load } from 'js-yaml';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export interface ImportResponse {
  data?: ImportResponseData;
  msg?: string;
}

export interface ImportResponseData {
  success_count?: number;
  failed_count?: number;
  success_list?: Array<{ workflow_id: string }>;
  failed_list?: Array<{ error_message: string }>;
}

export const parseFileContent = (
  fileContent: string,
  isYamlFile: boolean,
): Record<string, unknown> => {
  if (isYamlFile) {
    return load(fileContent) as Record<string, unknown>;
  }
  return JSON.parse(fileContent);
};

export const validateWorkflowData = (
  workflowData: Record<string, unknown>,
): void => {
  if (!workflowData || typeof workflowData !== 'object') {
    throw new Error(I18n.t('workflow_import_error_invalid_structure'));
  }

  if (!workflowData.name && !workflowData.workflow_id) {
    throw new Error(I18n.t('workflow_import_error_missing_name'));
  }
};

export const getErrorKey = (status: number): string => {
  switch (status) {
    case HTTP_STATUS.FORBIDDEN:
      return 'workflow_import_error_permission';
    case HTTP_STATUS.BAD_REQUEST:
      return 'workflow_import_error_invalid_file';
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
    case HTTP_STATUS.GATEWAY_TIMEOUT:
      return 'workflow_import_error_network';
    default:
      return 'workflow_import_failed';
  }
};

export interface HandleSuccessResultParams {
  responseData: ImportResponseData;
  goWorkflowDetail?: (workflowId: string, spaceId?: string) => void;
  refreshPage?: () => void;
  spaceId?: string;
}

export const handleSuccessResult = (
  params: HandleSuccessResultParams,
): void => {
  Toast.success(I18n.t('workflow_import_success'));

  if (params.refreshPage) {
    params.refreshPage();
  }

  if (
    params.goWorkflowDetail &&
    params.responseData.success_list?.[0]?.workflow_id
  ) {
    params.goWorkflowDetail(
      params.responseData.success_list[0].workflow_id,
      params.spaceId,
    );
  }
};

export const handleFailureResult = (
  responseData: ImportResponseData,
  result: ImportResponse,
): never => {
  const failedCount =
    responseData.failed_count || responseData.failed_list?.length || 0;

  if (failedCount > 0) {
    const errorMessage =
      responseData.failed_list?.[0]?.error_message ||
      I18n.t('workflow_import_failed');
    throw new Error(errorMessage);
  }

  throw new Error(result.msg || I18n.t('workflow_import_failed'));
};
