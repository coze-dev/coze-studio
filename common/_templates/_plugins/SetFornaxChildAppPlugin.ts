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
