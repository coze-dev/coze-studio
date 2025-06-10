import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

import { Plugin } from '@coze-studio/workspace-base';
import { usePluginStoreInstance } from '@coze-studio/bot-plugin-store';

const Page = () => {
  const { plugin_id, space_id } = useParams();
  const pluginStore = usePluginStoreInstance();
  if (!plugin_id || !space_id) {
    throw Error('[plugin render error]: need plugin id and space id');
  }
  useEffect(() => {
    pluginStore?.getState().init();
  }, []);
  return <Plugin />;
};

export default Page;
