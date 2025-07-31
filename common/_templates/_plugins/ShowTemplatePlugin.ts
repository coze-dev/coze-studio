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

import type {
  IPlugin,
  IHooks,
  ITemplatesHook,
  IPromptsHookParams,
} from 'rush-init-project-plugin';
// FIXME:
// 按照 https://github.com/bytemate/rush-plugins/blob/main/rush-plugins/rush-init-project-plugin/docs/init_project_configuration.md
// 一文的指引，无法正确 resolve 到对应模块，暂时没找到解决方案，故此处先用相对路径引用
// 未来需要调整为正常的 node_modules 引用方式
import {
  getTemplatesFolder,
  getTemplateNameList,
} from '../../autoinstallers/plugins/node_modules/rush-init-project-plugin/lib/logic/templateFolder';
import { parseCommandLineArguments } from './utils/parse-args';

export default class ShowTemplatePlugin implements IPlugin {
  apply(hooks: IHooks): void {
    const args = parseCommandLineArguments();

    const answer = JSON.parse(args.answer ?? '{}');
    const isShowChatAreaTemplate = answer['showTemplate'];

    hooks.templates.tap('ShowTemplatePlugin', (templates: ITemplatesHook) => {
      const templateFolder: string = getTemplatesFolder();
      const templateNameList = getTemplateNameList(templateFolder);

      const filteredNormalTemplateNameList = templateNameList.filter(
        item => !item.templateFolder?.includes('chat-'),
      );

      templates.templates.push(
        ...(isShowChatAreaTemplate
          ? templateNameList
          : filteredNormalTemplateNameList),
      );
    });
  }
}
