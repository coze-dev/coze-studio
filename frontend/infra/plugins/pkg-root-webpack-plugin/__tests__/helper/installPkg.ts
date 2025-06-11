import { projectInstallSync } from 'pkg-install';

const installPkg = (dir: string): any =>
  projectInstallSync({ cwd: dir, prefer: 'npm' });

export default installPkg;
