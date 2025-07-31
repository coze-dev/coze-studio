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
import React, { type ReactNode, useEffect } from 'react';

import qs from 'qs';
import {
  BotPluginStoreProvider,
  usePluginStoreInstance,
} from '@coze-studio/bot-plugin-store';
import {
  useSpaceId,
  useCurrentWidgetContext,
  useIDEParams,
  useTitle,
  useProjectId,
  useIDENavigate,
  useCommitVersion,
} from '@coze-project-ide/framework';
import { usePrimarySidebarStore } from '@coze-project-ide/biz-components';
import {
  PluginDetailPage,
  ToolDetailPage,
  MockSetDetail,
  MockSetList,
} from '@coze-agent-ide/bot-plugin/page';

import { ModuleType } from './types';

interface MainProps {
  renderCustomContent?: (params: {
    moduleType: ModuleType | undefined;
  }) => ReactNode;
}

interface PluginProviderContentProps extends MainProps {
  pluginID: string;
  spaceID: string;
  projectID: string;
  refetch: () => Promise<void>;
  version: string;
}

// Added PluginProviderContent Components
const PluginProviderContent: React.FC<PluginProviderContentProps> = ({
  pluginID,
  spaceID,
  projectID,
  refetch,
  version,
  renderCustomContent,
}) => {
  const pluginStore = usePluginStoreInstance();
  const queryObject = useIDEParams();

  const moduleType = queryObject.module as ModuleType | undefined;

  const toolID = queryObject.tool_id;
  const mocksetID = queryObject.mockset_id;

  if (moduleType === ModuleType.MOCKSET_DETAIL && (!toolID || !mocksetID)) {
    throw Error('xxxxxxxx');
  }

  if (moduleType === ModuleType.MOCKSET_LIST && !toolID) {
    throw Error('xxxxxxxx');
  }

  if (moduleType === ModuleType.TOOL && !toolID) {
    throw Error('xxxxxxxx');
  }

  const renderPlugin =
    !moduleType ||
    ![
      ModuleType.TOOL,
      ModuleType.MOCKSET_LIST,
      ModuleType.MOCKSET_DETAIL,
      ModuleType.CLOUD_IDE,
    ].includes(moduleType);

  useEffect(() => {
    pluginStore?.getState().init();
  }, []);

  return (
    <>
      {renderPlugin ? (
        <PluginDetailPage projectId={projectID} keepDocTitle />
      ) : null}
      {moduleType === ModuleType.TOOL && toolID ? (
        <ToolDetailPage
          toolID={toolID}
          onDebugSuccessCallback={() => {
            refetch();
          }}
        />
      ) : null}
      {moduleType === ModuleType.MOCKSET_LIST && toolID ? (
        <MockSetList toolID={toolID} />
      ) : null}
      {moduleType === ModuleType.MOCKSET_DETAIL && toolID && mocksetID ? (
        <MockSetDetail
          toolID={toolID}
          mocksetID={mocksetID}
          pluginID={pluginID}
          spaceID={spaceID}
          version={version}
        />
      ) : null}
      {renderCustomContent?.({ moduleType })}
    </>
  );
};

const Main: React.FC<MainProps> = props => {
  const spaceID = useSpaceId();
  const projectID = useProjectId();
  const IDENav = useIDENavigate();
  const { version } = useCommitVersion();

  const { uri, widget } = useCurrentWidgetContext();
  const title = useTitle();

  const refetch = usePrimarySidebarStore(state => state.refetch);

  const pluginID = uri?.displayName;

  if (!spaceID || !pluginID) {
    throw Error('xxxxxxxx');
  }

  const navBase = `/plugin/${pluginID}`;

  return (
    <BotPluginStoreProvider
      pluginID={pluginID}
      spaceID={spaceID}
      projectID={projectID}
      version={version}
      onUpdateDisplayName={displayName => {
        widget.setTitle(displayName); // Set tab title
        if (displayName && displayName !== title) {
          refetch(); // Update sidebar name
        }
      }}
      onStatusChange={status => {
        widget.setUIState(status);
      }}
      resourceNavigate={{
        // eslint-disable-next-line max-params
        toResource: (resource, rid, query, opts) =>
          rid ? IDENav(`/${resource}/${rid}?${qs.stringify(query)}`, opts) : '',
        tool: (tool_id, query, opts) =>
          IDENav(
            `${navBase}?module=tool&tool_id=${tool_id}&${qs.stringify(query)}`,
            opts,
          ),
        mocksetList: (tool_id, query, opts) =>
          IDENav(
            `${navBase}?module=mockset_list&tool_id=${tool_id}&${qs.stringify(
              query,
            )}`,
            opts,
          ),
        // eslint-disable-next-line max-params
        mocksetDetail: (tool_id, mockset_id, query, opts) =>
          IDENav(
            `${navBase}?module=mockset_detail&tool_id=${tool_id}&mockset_id=${mockset_id}&${qs.stringify(
              query,
            )}`,
            opts,
          ),
        cloudIDE: (query, opts) =>
          IDENav(`${navBase}?module=cloud_ide&${qs.stringify(query)}`, opts),
      }}
    >
      <PluginProviderContent
        pluginID={pluginID}
        spaceID={spaceID}
        projectID={projectID}
        refetch={refetch}
        version={version}
        {...props}
      />
    </BotPluginStoreProvider>
  );
};

export default Main;
