import { RushConfiguration } from '@rushstack/rush-sdk';

const getRushConfiguration = (() => {
  let rushConfig: RushConfiguration;
  return () => {
    if (!rushConfig) {
      rushConfig = RushConfiguration.loadFromDefaultLocation({});
    }
    return rushConfig;
  };
})();

import OriginPkgRootWebpackPlugin from '@coze-arch/pkg-root-webpack-plugin-origin';

type PkgRootWebpackPluginOptions = Record<string, unknown>;

class PkgRootWebpackPlugin extends OriginPkgRootWebpackPlugin {
  constructor(options?: Partial<PkgRootWebpackPluginOptions>) {
    const rushJson = getRushConfiguration();
    const rushJsonPackagesDir = rushJson.projects.map(
      item => item.projectFolder,
    );
    // .filter(item => !item.includes('/apps/'));

    const mergedOptions = Object.assign({}, options || {}, {
      root: '@',
      packagesDirs: rushJsonPackagesDir,
      // 排除apps/*，减少处理时间
      excludeFolders: [],
    });
    super(mergedOptions);
  }
}

export default PkgRootWebpackPlugin;

export { PkgRootWebpackPlugin };
