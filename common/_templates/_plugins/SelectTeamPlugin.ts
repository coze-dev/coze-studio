import type {
  IPlugin,
  IHooks,
  IPromptsHookParams,
} from "rush-init-project-plugin";
import { readFileSync } from 'fs';
import path from 'path';
import JSON5 from '../../autoinstallers/plugins/node_modules/json5'

const rushJson = JSON5.parse(
  readFileSync(
    path.resolve(__dirname, '../../../rush.json')
  ).toString('utf-8')
);

export default class SelectTeamPlugin implements IPlugin {
  apply(hooks: IHooks): void {
    hooks.prompts.tap("SelectTeamPlugin", (prompts: IPromptsHookParams) => {

      // 只留下以team-为前缀的
      const teamNamePrefix = /^team-/;
      const choices = rushJson.allowedProjectTags.filter(
        teamName => teamNamePrefix.test(teamName)
      ).map(
        teamName => teamName.replace(teamNamePrefix, '')
      );

      // unshift一个问题，使得用户选择完模版后展示该问题。
      prompts.promptQueue.unshift({
        type: "list",
        name: "team",
        message: "Select your team",
        choices,
        default: 0, // 默认选择choices[0]
      });

      const projectFolderPrompt = prompts.promptQueue.find(
        item => item.name === 'projectFolder'
      );
      projectFolderPrompt.default = (answers) => {
        // 文件夹名去除scope，如 @coze-arch/foo -> foo
        const folderDir = answers.packageName.split('/').slice(-1)[0];
        return `packages/${answers.team}/${folderDir}`
      }
    });
  }
}
