const {
  excludeIgnoredFiles,
  groupChangedFilesByProject,
  getRushConfiguration,
} = require('./utils');
const micromatch = require('micromatch');
const path = require('path');
const fs = require('fs');

module.exports = {
  '**/*.{ts,tsx,js,jsx,mjs}': async files => {
    const match = micromatch.not(files, [
      '**/common/_templates/!(_*)/**/(.)?*',
    ]);
    const changedFileGroup = await groupChangedFilesByProject(match);
    const eslintCmds = Object.entries(changedFileGroup)
    .filter(([packageName]) =>
      packageName !== '@coze-arch/arco-icon' && packageName !== '@coze-arch/arco-illustration')
    .map(
      ([packageName, changedFiles]) => {
        const rushConfiguration = getRushConfiguration();
        const { projectFolder, packageName: name } =
          rushConfiguration.getProjectByName(packageName);
        const filesToCheck = changedFiles
          .map(f => path.relative(projectFolder, f))
          .join(' ');
        // TSESTREE_SINGLE_RUN doc https://typescript-eslint.io/packages/parser/#allowautomaticsingleruninference
        // 切换到项目文件夹，并运行 ESLint 命令
        const cmd = [
          `cd ${projectFolder}`,
          `TSESTREE_SINGLE_RUN=true eslint --fix --cache ${filesToCheck} --no-error-on-unmatched-pattern`,
        ].join(' && ');
        return {
          name,
          cmd,
        };
      },
    );

    if (!eslintCmds.length) return [];

    if (eslintCmds.length > 16) {
      console.log(
        `For performance reason, skip ESlint detection due to ${eslintCmds.length} eslint commands.`,
      );
      return [];
    }

    return [
      // 这里不能直接返回 eslintCmds 数组，因为 lint-staged 会依次串行执行每个命令
      // 而 concurrently 会并行执行多个命令
      `concurrently --max-process 8  --names ${eslintCmds
        .map(r => `${r.name}`)
        .join(',')} --kill-others-on-fail ${eslintCmds
        .map(r => `"${r.cmd}"`)
        .join(' ')}`,
    ];
  },
  '**/*.{less,scss,css}': files => {
    // 暂时只修复，不报错卡点
    return [`stylelint ${files.join(' ')} --fix || exit 0`];
  },
  '**/package.json': async files => {
    const match = micromatch.not(files, [
      '**/common/_templates/!(_*)/**/(.)?*',
    ]);
    const filesToLint = await excludeIgnoredFiles(match);
    if (!filesToLint) return [];
    return [
      // https://eslint.org/docs/latest/flags/#enable-feature-flags-with-the-cli
      // eslint v9默认从cwd找配置，这里需要使用 unstable_config_lookup_from_file 配置，否则会报错
      `eslint --cache ${filesToLint} --flag unstable_config_lookup_from_file`,
      `prettier ${filesToLint} --write`,
    ];
  },
  '**/!(package).json': 'prettier --write',
};
