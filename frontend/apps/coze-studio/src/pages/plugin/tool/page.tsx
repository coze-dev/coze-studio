import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

import { Tool } from '@coze-studio/workspace-base';
import { usePluginStoreInstance } from '@coze-studio/bot-plugin-store';
const Page = () => {
  const { plugin_id, space_id, tool_id } = useParams();
  const pluginStore = usePluginStoreInstance();
  if (!plugin_id || !space_id || !tool_id) {
    throw Error('[plugin render error]: need plugin id and space id');
  }
  useEffect(() => {
    pluginStore?.getState().init();
  }, []);
  return <Tool toolID={tool_id} />;
};

export default Page;
