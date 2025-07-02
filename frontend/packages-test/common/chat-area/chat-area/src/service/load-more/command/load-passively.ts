import { LoadCommand, type LoadCommandEnvTools } from '../load-command';

export class LoadPassivelyCommand extends LoadCommand {
  action = null;
  constructor(envTools: LoadCommandEnvTools, private endIndex: string) {
    super(envTools);
  }

  async load() {
    const { messageIndexHelper } = this.envTools;
    messageIndexHelper.updateEndIndexForMore(this.endIndex);
    await Promise.resolve();
  }
}
