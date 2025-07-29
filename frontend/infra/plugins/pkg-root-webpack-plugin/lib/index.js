"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PkgRootWebpackPlugin = void 0;
const rush_sdk_1 = require("@rushstack/rush-sdk");
const getRushConfiguration = (() => {
    let rushConfig;
    return () => {
        if (!rushConfig) {
            rushConfig = rush_sdk_1.RushConfiguration.loadFromDefaultLocation({});
        }
        return rushConfig;
    };
})();
const pkg_root_webpack_plugin_origin_1 = __importDefault(require("@coze-arch/pkg-root-webpack-plugin-origin"));
class PkgRootWebpackPlugin extends pkg_root_webpack_plugin_origin_1.default {
    constructor(options) {
        const rushJson = getRushConfiguration();
        const rushJsonPackagesDir = rushJson.projects.map(item => item.projectFolder);
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
exports.PkgRootWebpackPlugin = PkgRootWebpackPlugin;
exports.default = PkgRootWebpackPlugin;
