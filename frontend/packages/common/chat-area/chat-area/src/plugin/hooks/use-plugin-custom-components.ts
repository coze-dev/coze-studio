import { type CustomComponent } from '../types/plugin-component';
import { type PluginName } from '../constants/plugin-name';
import { usePluginList } from './use-plugin-list';

interface ComponentConfig<K extends keyof CustomComponent> {
  pluginName: PluginName;
  // eslint-disable-next-line @typescript-eslint/naming-convention -- 符合预期
  Component: CustomComponent[K];
}

export const usePluginCustomComponents = <K extends keyof CustomComponent>(
  componentKey: K,
) => {
  const pluginList = usePluginList();
  const pluginComponentsList = pluginList
    .map(_plugin => ({
      pluginName: _plugin.pluginName,
      Component: _plugin.customComponents?.[componentKey],
    }))
    .filter((componentConfig): componentConfig is ComponentConfig<K> =>
      Boolean(componentConfig.Component),
    );

  return pluginComponentsList;
};
