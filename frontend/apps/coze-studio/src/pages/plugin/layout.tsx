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
