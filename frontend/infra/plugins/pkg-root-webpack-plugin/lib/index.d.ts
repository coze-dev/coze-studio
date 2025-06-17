import OriginPkgRootWebpackPlugin from '@coze-arch/pkg-root-webpack-plugin-origin';
type PkgRootWebpackPluginOptions = Record<string, unknown>;
declare class PkgRootWebpackPlugin extends OriginPkgRootWebpackPlugin {
    constructor(options?: Partial<PkgRootWebpackPluginOptions>);
}
export default PkgRootWebpackPlugin;
export { PkgRootWebpackPlugin };
