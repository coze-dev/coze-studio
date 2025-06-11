import SelectTeamPlugin from '../_plugins/SelectTeamPlugin';
import SetDefaultAuthorPlugin from '../_plugins/SetDefaultAuthorPlugin';
import type { IConfig } from '../../autoinstallers/plugins/node_modules/rush-init-project-plugin';

const config: IConfig = {
  plugins: [new SetDefaultAuthorPlugin(), new SelectTeamPlugin()],
  defaultProjectConfiguration: {
    tags:['level-3']
  }
};

export default config;
