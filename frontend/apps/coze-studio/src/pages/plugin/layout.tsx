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

import { Outlet, useNavigate, useParams } from 'react-router-dom';

import { pluginResourceNavigate } from '@coze-studio/workspace-base';
import { BotPluginStoreProvider } from '@coze-studio/bot-plugin-store';

const SpaceLayout = () => {
  const { plugin_id, space_id } = useParams();
  const navBase = `/space/${space_id}`;
  const navigate = useNavigate();
  if (!plugin_id || !space_id) {
    throw Error('[plugin render error]: need plugin id and space id');
  }
  return (
    <BotPluginStoreProvider
      pluginID={plugin_id}
      spaceID={space_id}
      resourceNavigate={pluginResourceNavigate(navBase, plugin_id, navigate)}
    >
      <Outlet />
    </BotPluginStoreProvider>
  );
};

export default SpaceLayout;
