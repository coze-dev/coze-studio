import type { IConfig } from '../../autoinstallers/plugins/node_modules/rush-init-project-plugin';
import SelectTeamPlugin from '../_plugins/SelectTeamPlugin';
import SetDefaultAuthorPlugin from '../_plugins/SetDefaultAuthorPlugin';

const config: IConfig = {
  plugins: [new SetDefaultAuthorPlugin(), new SelectTeamPlugin()],
  defaultProjectConfiguration: {
    tags:['level-3']
  }
};

export default config;
