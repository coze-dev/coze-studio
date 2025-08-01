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

import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import {
  AbilityScope,
  TOOL_KEY_TO_API_STATUS_KEY_MAP,
  type ToolKey,
} from '@coze-agent-ide/tool-config';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { ErrorBoundary } from '@coze-arch/logger';
import { TabStatus } from '@coze-arch/bot-api/developer_api';

import { ToolContainerFallback } from '../fallbacks';
import { useGetToolConfig } from '../../hooks/builtin/use-get-tool-config';
import { usePreference } from '../../context/preference-context';
import { AbilityConfigContextProvider } from '../../context/ability-config-context';

interface IProps {
  scope: AbilityScope;
  toolKey?: ToolKey;
  onMouseOver?: (toolKey: string | undefined) => void;
  onMouseLeave?: (toolKey: string | undefined) => void;
}

export const ToolContainer: FC<PropsWithChildren<IProps>> = ({
  children,
  toolKey,
  onMouseOver,
  onMouseLeave,
}) => {
  const { enableToolHiddenMode, isReadonly } = usePreference();

  const toolStatus = usePageRuntimeStore(state =>
    toolKey
      ? state.botSkillBlockCollapsibleState[
          TOOL_KEY_TO_API_STATUS_KEY_MAP[toolKey]
        ]
      : null,
  );

  const getToolConfig = useGetToolConfig();

  const toolConfig = getToolConfig(toolKey);

  const getInvisible = () => {
    if (!enableToolHiddenMode) {
      return false;
    }

    if (isReadonly) {
      return !toolConfig?.hasValidData;
    }

    return toolStatus === TabStatus.Hide;
  };

  const invisible = getInvisible();

  const handleOnMouseEnter = (key: string) => {
    const siblingClassList = document.querySelector(`.collapse-panel-${key}`)
      ?.previousElementSibling?.classList;
    // Hide the underscore if a sibling is found
    if (siblingClassList?.contains('collapse-panel')) {
      siblingClassList.add('collapse-panel-hide-underline');
    }
  };

  const handleOnMouseLeave = () => {
    const className = 'collapse-panel-hide-underline';
    document
      .querySelectorAll(`.${className}`)
      .forEach(element => element.classList.remove(className));
  };

  return (
    <div
      className={classNames({
        hidden: invisible,
        'collapse-panel': true,
        [`collapse-panel-${toolKey}`]: true,
      })}
      onMouseEnter={() => {
        if (toolKey) {
          handleOnMouseEnter(toolKey);
        }
      }}
      onMouseLeave={handleOnMouseLeave}
    >
      <ErrorBoundary
        errorBoundaryName={`botEditorTool${toolConfig?.toolKey}`}
        FallbackComponent={() => (
          <ToolContainerFallback toolTitle={toolConfig?.toolTitle} />
        )}
      >
        <AbilityConfigContextProvider
          abilityKey={toolKey}
          scope={AbilityScope.TOOL}
        >
          {children}
        </AbilityConfigContextProvider>
      </ErrorBoundary>
    </div>
  );
};
