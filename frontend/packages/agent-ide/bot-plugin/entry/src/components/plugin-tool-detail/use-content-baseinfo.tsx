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
import { type PluginAPIInfo } from '@coze-arch/bot-api/plugin_develop';
import { IconEdit } from '@coze-arch/bot-icons';
import { useBaseInfo } from '@coze-agent-ide/bot-plugin-tools/useBaseInfo';
import { type RenderEnhancedComponentProps } from '@coze-agent-ide/bot-plugin-tools/pluginModal/types';
import { STARTNODE } from '@coze-agent-ide/bot-plugin-tools/pluginModal/config';
import { Button } from '@coze-arch/coze-design';

import { SecurityCheckFailed } from '@/components/check_failed';

interface UseContentBaseInfoProps
  extends Pick<Partial<RenderEnhancedComponentProps>, 'renderDescComponent'> {
  space_id: string;
  plugin_id: string;
  tool_id: string;
  apiInfo?: PluginAPIInfo;
  canEdit: boolean;
  handleInit: (loading?: boolean) => Promise<void>;
  wrapWithCheckLock: (fn: () => void) => () => Promise<void>;
  editVersion?: number;
}
export const useContentBaseInfo = ({
  space_id,
  plugin_id,
  tool_id,
  apiInfo,
  canEdit,
  handleInit,
  wrapWithCheckLock,
  editVersion,
  renderDescComponent,
}: UseContentBaseInfoProps) => {
  // Is the security check failure message displayed?
  const [showSecurityCheckFailedMsg, setShowSecurityCheckFailedMsg] =
    useState(false);
  const [isBaseInfoDisabled, setIsBaseInfoDisabled] = useState(true);

  // Basic information
  const { baseInfoNode, submitBaseInfo } = useBaseInfo({
    pluginId: plugin_id || '',
    apiId: tool_id,
    baseInfo: apiInfo,
    showModal: false,
    disabled: isBaseInfoDisabled,
    showSecurityCheckFailedMsg,
    setShowSecurityCheckFailedMsg,
    editVersion,
    space_id,
    renderEnhancedComponent: renderDescComponent,
  });

  return {
    isBaseInfoDisabled,
    header: I18n.t('Create_newtool_s1_title'),
    itemKey: 'baseInfo',
    extra: (
      <>
        {showSecurityCheckFailedMsg ? (
          <SecurityCheckFailed step={STARTNODE} />
        ) : null}
        {!isBaseInfoDisabled && (
          <Button
            color="primary"
            className="mr-2"
            onClick={e => {
              e.stopPropagation();
              setIsBaseInfoDisabled(true);
            }}
          >
            {I18n.t('project_plugin_setup_metadata_cancel')}
          </Button>
        )}
        {canEdit && !isBaseInfoDisabled ? (
          <Button
            onClick={async e => {
              e.stopPropagation();
              const status = await submitBaseInfo();
              // After the update is successful, proceed to the next step
              if (status) {
                handleInit();
              }
              setIsBaseInfoDisabled(true);
            }}
            className="mr-2"
          >
            {I18n.t('project_plugin_setup_metadata_save')}
          </Button>
        ) : null}

        {canEdit && isBaseInfoDisabled ? (
          <Button
            icon={<IconEdit className="!pr-0" />}
            color="primary"
            className="!bg-transparent !coz-fg-secondary"
            onClick={e => {
              const el = document.querySelector(
                '.plugin-tool-detail-baseInfo .semi-collapsible-wrapper',
              ) as HTMLElement;
              if (parseInt(el?.style?.height) !== 0) {
                e.stopPropagation();
              }
              wrapWithCheckLock(() => {
                setIsBaseInfoDisabled(false);
              })();
            }}
          >
            {I18n.t('project_plugin_setup_metadata_edit')}
          </Button>
        ) : null}
      </>
    ),
    content: baseInfoNode,
    classNameWrap: 'plugin-tool-detail-baseInfo',
  };
};
