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
  IPromptsHookParams,
} from 'rush-init-project-plugin';
import { readFileSync } from 'fs';
import path from 'path';
import JSON5 from '../../autoinstallers/plugins/node_modules/json5';

const rushJson = JSON5.parse(
  readFileSync(path.resolve(__dirname, '../../../rush.json')).toString('utf-8'),
);

export default class SelectTeamPlugin implements IPlugin {
  apply(hooks: IHooks): void {
    hooks.prompts.tap('SelectTeamPlugin', (prompts: IPromptsHookParams) => {
      // Leave only the prefix team-
      const teamNamePrefix = /^team-/;
      const choices = rushJson.allowedProjectTags
        .filter(teamName => teamNamePrefix.test(teamName))
        .map(teamName => teamName.replace(teamNamePrefix, ''));

      // Unshift an issue, causing the user to display the issue after selecting a template.
      prompts.promptQueue.unshift({
        type: 'list',
        name: 'team',
        message: 'Select your team',
        choices,
        default: 0, // Default choices [0]
      });

      const projectFolderPrompt = prompts.promptQueue.find(
        item => item.name === 'projectFolder',
      );
      projectFolderPrompt.default = answers => {
        // Remove the scope from the folder name, such as @code-arch/foo - > foo
        const folderDir = answers.packageName.split('/').slice(-1)[0];
        return `frontend/packages/${answers.team}/${folderDir}`;
      };
    });
  }
}
