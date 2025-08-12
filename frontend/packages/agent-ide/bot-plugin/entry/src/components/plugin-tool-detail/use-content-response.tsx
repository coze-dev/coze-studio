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

/* eslint-disable complexity */

import { useEffect, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconEdit } from '@coze-arch/bot-icons';
import {
  PluginType,
  type GetPluginInfoResponse,
  type PluginAPIInfo,
  DebugExampleStatus,
  type UpdateAPIResponse,
} from '@coze-arch/bot-api/plugin_develop';
import { useResponseParams } from '@coze-agent-ide/bot-plugin-tools/useResponseParams';
import { type RenderEnhancedComponentProps } from '@coze-agent-ide/bot-plugin-tools/pluginModal/types';
import { RESPONSENODE } from '@coze-agent-ide/bot-plugin-tools/pluginModal/config';
import { Button } from '@coze-arch/coze-design';

import { OauthButtonAction } from '@/components/oauth-action';
import { SecurityCheckFailed } from '@/components/check_failed';

interface UseContentResponseProps
  extends Pick<Partial<RenderEnhancedComponentProps>, 'renderParamsComponent'> {
  apiInfo?: PluginAPIInfo;
  plugin_id: string;
  tool_id: string;
  editVersion?: number;
  pluginInfo?: GetPluginInfoResponse & { plugin_id?: string };
  canEdit: boolean;
  handleInit: (loading?: boolean) => Promise<void>;
  wrapWithCheckLock: (fn: () => void) => () => Promise<void>;
  debugApiInfo?: PluginAPIInfo;
  setDebugApiInfo: (apiInfo: PluginAPIInfo) => void;
  spaceID: string;
  onSuccess?: (params: UpdateAPIResponse) => void;
}

export const useContentResponse = ({
  apiInfo,
  plugin_id,
  tool_id,
  editVersion,
  pluginInfo,
  canEdit,
  handleInit,
  wrapWithCheckLock,
  debugApiInfo,
  setDebugApiInfo,
  spaceID,
  onSuccess,
  renderParamsComponent,
}: UseContentResponseProps) => {
  // Is the security check failure message displayed?
  const [showSecurityCheckFailedMsg, setShowSecurityCheckFailedMsg] =
    useState(false);
  const [isResponseParamsDisabled, setIsResponseParamsDisabled] =
    useState(true);
  // The third step is to set the corresponding parameters of the hooks component
  const { responseParamsNode, submitResponseParams, extra } = useResponseParams(
    {
      apiInfo,
      pluginId: plugin_id || '',
      responseParams: apiInfo?.response_params,
      requestParams: apiInfo?.request_params,
      apiId: tool_id || '',
      disabled: isResponseParamsDisabled,
      showSecurityCheckFailedMsg,
      setShowSecurityCheckFailedMsg,
      editVersion,
      pluginType: pluginInfo?.plugin_type,
      functionName:
        pluginInfo?.plugin_type === PluginType.LOCAL
          ? apiInfo?.function_name
          : undefined,
      spaceID,
      onSuccess,
      renderEnhancedComponent: renderParamsComponent,
    },
  );

  // When dealing with debugging, the example data is displayed first and then hidden
  useEffect(() => {
    if (!isResponseParamsDisabled) {
      setDebugApiInfo({
        ...debugApiInfo,
        debug_example: {},
        debug_example_status: DebugExampleStatus.Disable,
      });
    }
  }, [isResponseParamsDisabled]);

  return {
    isResponseParamsDisabled,
    header: I18n.t('Create_newtool_s3_Outputparameters'),
    itemKey: 'response',
    extra: (
      <>
        {showSecurityCheckFailedMsg ? (
          <SecurityCheckFailed step={RESPONSENODE} />
        ) : null}
        {!isResponseParamsDisabled && canEdit ? <OauthButtonAction /> : null}
        {!isResponseParamsDisabled ? extra : null}
        {!isResponseParamsDisabled ? (
          <Button
            onClick={e => {
              e.stopPropagation();
              setIsResponseParamsDisabled(true);
            }}
            color="primary"
            className="mr-2"
          >
            {I18n.t('project_plugin_setup_metadata_cancel')}
          </Button>
        ) : null}
        {canEdit && !isResponseParamsDisabled ? (
          <Button
            onClick={async e => {
              e.stopPropagation();
              const status = await submitResponseParams();
              // After the update is successful, proceed to the next step
              if (status) {
                handleInit();
                setIsResponseParamsDisabled(true);
              }
            }}
            className="mr-2"
          >
            {I18n.t('project_plugin_setup_metadata_save')}
          </Button>
        ) : null}

        {canEdit && isResponseParamsDisabled ? (
          <Button
            icon={<IconEdit className="!pr-0" />}
            color="primary"
            className="!bg-transparent !coz-fg-secondary"
            onClick={e => {
              const el = document.querySelector(
                '.plugin-tool-detail-response .semi-collapsible-wrapper',
              ) as HTMLElement;
              if (parseInt(el?.style?.height) !== 0) {
                e.stopPropagation();
              }
              wrapWithCheckLock(() => {
                setIsResponseParamsDisabled(false);
              })();
            }}
          >
            {I18n.t('project_plugin_setup_metadata_edit')}
          </Button>
        ) : null}
      </>
    ),
    content: responseParamsNode,
    classNameWrap: 'plugin-tool-detail-response',
  };
};
