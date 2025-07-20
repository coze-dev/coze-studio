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
 
import type { IHooks, IPlugin, IPromptsHookParams } from 'rush-init-project-plugin';
import { parseCommandLineArguments } from './utils/parse-args';

export default class FornaxPlugin implements IPlugin {
  apply(hooks: IHooks): void {
    hooks.answers.tap('FornaxPlugin', (answers) => {
      if(answers.template === 'fornax-child-app') {
        if(answers.packageName.startsWith('@flow-devops/fornax-')) {
          answers.childAppName = answers.packageName.replace('@flow-devops/fornax-','');
        } else {
          throw new Error('The initialization of field childAppName failed because the packageName is invalid. Please use "@flow-devops/fornax-xxx."');
        }
      }
    })
  }
}
