import { type Compiler } from 'webpack';
interface PkgRootWebpackPluginOptions {
    root?: string;
    excludeFolders?: string[];
}
declare class PkgRootWebpackPlugin {
    private options;
    rootFolders: string[];
    constructor(options?: Partial<PkgRootWebpackPluginOptions>);
    apply(compiler: Compiler): void;
}
export default PkgRootWebpackPlugin;
export { PkgRootWebpackPlugin };
