const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

// node scripts/checksum-by-change.js /usr/changed-path.json
// change-path 文件来自 ci
const changedPath = process.argv[2];
const readJson = async jsonFile => {
  const content = await fs.readFile(jsonFile, 'utf-8');
  let _val = null;
  try {
    eval(`_val = ${content}`);
    return _val;
  } catch (e) {
    console.error(`json parse failure: `, e);
  }
};

const readChangedPackages = async changedPath => {
  const [changedFiles, { projects }] = await Promise.all([
    readJson(changedPath),
    readJson(path.resolve(__dirname, '../../rush.json')),
  ]);
  const changedProjects = projects
    .filter(project => {
      const { projectFolder } = project;
      const endsWithSlash = projectFolder.endsWith('/');
      const compareFolder = `${projectFolder}${endsWithSlash ? '' : '/'}`;
      if (!changedFiles) {
        // changed-path.json 内容可能为null
        return true;
      }
      const matched = changedFiles.find(file => file.startsWith(compareFolder));
      return !!matched;
    })
    .map(({ packageName }) => packageName)
    .sort((r1, r2) => r1.localeCompare(r2));
  return changedProjects;
};

async function main() {
  if (!changedPath || changedPath.length <= 0) {
    throw new Error(`Please pass the correct "changedPath" path`);
  }
  const changedPackages = await readChangedPackages(changedPath);

  const hash = crypto.createHash('md5');
  changedPackages.forEach(r => hash.update(r));
  const hashValue = hash.digest('hex');
  console.log(`::set-output name=hash::${hashValue}`);
}

main();
