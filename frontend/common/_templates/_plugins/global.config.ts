import type { IConfig } from '../../autoinstallers/plugins/node_modules/rush-init-project-plugin';
import ShowChatAreaTemplatePlugin from './ShowChatAreaTemplatePlugin';
import SetFornaxChildAppPlugin from './SetFornaxChildAppPlugin';

const config: IConfig = {
  plugins: [new ShowChatAreaTemplatePlugin(), new SetFornaxChildAppPlugin()]
};

export default config;
