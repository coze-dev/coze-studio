import { useEffect, useState } from 'react';

import { cloneDeep } from 'lodash-es';
import {
  type PluginAPIInfo,
  DebugExampleStatus,
} from '@coze-arch/bot-api/plugin_develop';
import { usePluginStore } from '@coze-studio/bot-plugin-store';

import { addDepthAndValue } from '../../components/plugin_modal/utils';
import { ExampleModal } from '../../components/example-modal';
import { setEditToolExampleValue } from './utils';

// @ts-expect-error -- linter-disable-autofix
export const useEditExample = ({ onUpdate }) => {
  const [visible, setVisible] = useState(false);
  const [apiInfo, setApiInfo] = useState<PluginAPIInfo>();

  const { pluginInfo } = usePluginStore(store => ({
    pluginInfo: store.pluginInfo,
  }));

  const openExample = (info: PluginAPIInfo) => {
    setVisible(true);

    if (
      info?.debug_example?.req_example &&
      info?.debug_example_status === DebugExampleStatus.Enable
    ) {
      const requestParams = cloneDeep(info?.request_params ?? []);
      setEditToolExampleValue(
        requestParams,
        JSON.parse(info?.debug_example?.req_example),
      );
      addDepthAndValue(requestParams);
      setApiInfo({ ...info, request_params: requestParams });
    } else {
      addDepthAndValue(info.request_params);
      setApiInfo(info);
    }
  };

  const closeExample = () => {
    setVisible(false);
  };
  const onSave = () => {
    onUpdate?.();
    closeExample();
  };
  useEffect(() => {
    if (!visible) {
      setApiInfo(undefined);
    }
  }, [visible]);
  return {
    exampleNode: (
      <ExampleModal
        visible={visible}
        onCancel={closeExample}
        pluginId={pluginInfo?.plugin_id ?? ''}
        apiInfo={apiInfo as PluginAPIInfo}
        pluginName={pluginInfo?.meta_info?.name ?? ''}
        onSave={onSave}
      />
    ),
    openExample,
  };
};
