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

import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconEdit } from '@coze-arch/bot-icons';
import {
  PluginType,
  type UpdateAPIResponse,
  type GetPluginInfoResponse,
  type PluginAPIInfo,
} from '@coze-arch/bot-api/plugin_develop';
import { useRequestParams } from '@coze-agent-ide/bot-plugin-tools/useRequestParams';
import { type RenderEnhancedComponentProps } from '@coze-agent-ide/bot-plugin-tools/pluginModal/types';
import { RESPONSENODE } from '@coze-agent-ide/bot-plugin-tools/pluginModal/config';
import { Button } from '@coze-arch/coze-design';

import { SecurityCheckFailed } from '@/components/check_failed';

interface UseContentRequestProps
  extends Pick<Partial<RenderEnhancedComponentProps>, 'renderParamsComponent'> {
  apiInfo?: PluginAPIInfo;
  plugin_id: string;
  tool_id: string;
  pluginInfo?: GetPluginInfoResponse & { plugin_id?: string };
  canEdit: boolean;
  handleInit: () => Promise<void>;
  wrapWithCheckLock: (fn: () => void) => () => Promise<void>;
  editVersion?: number;
  spaceID: string;
  onSuccess?: (params: UpdateAPIResponse) => void;
}

export const useContentRequest = ({
  apiInfo,
  plugin_id,
  tool_id,
  pluginInfo,
  canEdit,
  handleInit,
  wrapWithCheckLock,
  editVersion,
  spaceID,
  onSuccess,
  renderParamsComponent,
}: UseContentRequestProps) => {
  // Is the security check failure message displayed?
  const [showSecurityCheckFailedMsg, setShowSecurityCheckFailedMsg] =
    useState(false);
  const [isRequestParamsDisabled, setIsRequestParamsDisabled] = useState(true);
  // Set request parameters
  const { requestParamsNode, submitRequestParams, nlTool } = useRequestParams({
    apiInfo,
    pluginId: plugin_id || '',
    requestParams: apiInfo?.request_params,
    apiId: tool_id,
    disabled: isRequestParamsDisabled,
    showSecurityCheckFailedMsg,
    setShowSecurityCheckFailedMsg,
    editVersion,
    functionName:
      pluginInfo?.plugin_type === PluginType.LOCAL
        ? apiInfo?.function_name
        : undefined,
    spaceID,
    onSuccess,
    renderEnhancedComponent: renderParamsComponent,
  });
  return {
    isRequestParamsDisabled,
    itemKey: 'request',
    header: I18n.t('Create_newtool_s2'),
    extra: (
      <>
        {showSecurityCheckFailedMsg ? (
          <SecurityCheckFailed step={RESPONSENODE} />
        ) : null}
        {!isRequestParamsDisabled ? nlTool : null}
        {!isRequestParamsDisabled ? (
          <Button
            onClick={e => {
              e.stopPropagation();
              setIsRequestParamsDisabled(true);
            }}
            color="primary"
            className="mr-2"
          >
            {I18n.t('project_plugin_setup_metadata_cancel')}
          </Button>
        ) : null}
        {canEdit && !isRequestParamsDisabled ? (
          <Button
            onClick={async e => {
              e.stopPropagation();
              const status = await submitRequestParams();
              // After the update is successful, proceed to the next step
              if (status) {
                handleInit();
                setIsRequestParamsDisabled(true);
              }
            }}
            className="mr-2"
          >
            {I18n.t('project_plugin_setup_metadata_save')}
          </Button>
        ) : null}
        {canEdit && isRequestParamsDisabled ? (
          <Button
            icon={<IconEdit className="!pr-0" />}
            color="primary"
            className="!bg-transparent !coz-fg-secondary"
            onClick={e => {
              const el = document.querySelector(
                '.plugin-tool-detail-request .semi-collapsible-wrapper',
              ) as HTMLElement;
              if (parseInt(el?.style?.height) !== 0) {
                e.stopPropagation();
              }
              wrapWithCheckLock(() => {
                setIsRequestParamsDisabled(false);
              })();
            }}
          >
            {I18n.t('project_plugin_setup_metadata_edit')}
          </Button>
        ) : null}
      </>
    ),
    content: requestParamsNode,
    classNameWrap: 'plugin-tool-detail-request',
  };
};
