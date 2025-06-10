"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PkgRootWebpackPlugin = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const json5_1 = __importDefault(require("json5"));
const toAbsolute = (root, file) => {
    if (fs_1.default.existsSync(path_1.default.join(root, 'src'))) {
        return path_1.default.join(root, 'src', file);
    }
    return path_1.default.join(root, file);
};
class PkgRootWebpackPlugin {
    constructor(options) {
        const rootDir = path_1.default.resolve(__dirname, '../../../../');
        const rushJsonPath = path_1.default.resolve(rootDir, 'rush.json');
        const rushJsonStr = fs_1.default.readFileSync(rushJsonPath, 'utf-8');
        const rushJson = json5_1.default.parse(rushJsonStr);
        const rushJsonPackagesDir = rushJson.projects.map(item => item.projectFolder);
        this.rootFolders = rushJsonPackagesDir;
        this.options = {
            root: '@',
            // 排除apps/*，减少处理时间
            excludeFolders: fs_1.default
                .readdirSync(path_1.default.resolve(rootDir, 'apps'))
                .map(folder => `apps/${folder}`),
            ...(options || {}),
        };
    }
    apply(compiler) {
        const target = compiler.hooks.normalModuleFactory;
        target.tap('PkgRootWebpackPlugin', nmf => {
            nmf.hooks.beforeResolve.tapAsync('PkgRootWebpackPlugin', (request, callback) => {
                const innerRequest = request.request;
                if (!innerRequest) {
                    return callback();
                }
                const { root, excludeFolders = [] } = this.options;
                const { context } = request;
                if (innerRequest.startsWith(`${root}/`)) {
                    const folder = this.rootFolders.find(fold => context.indexOf(fold) !== -1 && !excludeFolders.includes(fold));
                    if (!folder) {
                        return callback();
                    }
                    const absolutePath = toAbsolute(context.slice(0, context.indexOf(folder) + folder.length), 
                    // @ts-expect-error -- linter-disable-autofix
                    innerRequest.slice(root.length));
                    request.request = absolutePath;
                }
                return callback();
            });
        });
    }
}
exports.PkgRootWebpackPlugin = PkgRootWebpackPlugin;
exports.default = PkgRootWebpackPlugin;
