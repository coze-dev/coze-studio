const path = require('path');

const { ESLint } = require('eslint');
const { RushConfiguration } = require('@microsoft/rush-lib');

const getRushConfiguration = (function () {
  let rushConfiguration = null;
  return function () {
    // eslint-disable-next-line
    return (rushConfiguration ||= RushConfiguration.loadFromDefaultLocation({
      startingFolder: process.cwd(),
    }));
  };
})();

// Get the project path where the change file is located
function withProjectFolder(changedFiles) {
  const projectFolders = [];

  try {
    const rushConfiguration = getRushConfiguration();
    const { rushJsonFolder } = rushConfiguration;
    const lookup = rushConfiguration.getProjectLookupForRoot(rushJsonFolder);

    for (const file of changedFiles) {
      const project = lookup.findChildPath(path.relative(rushJsonFolder, file));
      // Ignore items not defined in rush.json
      if (project) {
        const projectFolder = project?.projectFolder ?? rushJsonFolder;
        const packageName = project?.packageName;
        projectFolders.push({
          file,
          projectFolder,
          packageName,
        });
      }
    }
  } catch (e) {
    console.error(e);
    throw e;
  }

  return projectFolders;
}

async function excludeIgnoredFiles(changedFiles) {
  try {
    const eslintInstances = new Map();

    const changedFilesWithIgnored = await Promise.all(
      withProjectFolder(changedFiles).map(async ({ file, projectFolder }) => {
        let eslint = eslintInstances.get(projectFolder);
        if (!eslint) {
          eslint = new ESLint({ cwd: projectFolder });
          eslintInstances.set(projectFolder, eslint);
        }

        return {
          file,
          isIgnored: await eslint.isPathIgnored(file),
        };
      }),
    );

    return changedFilesWithIgnored
      .filter(change => !change.isIgnored)
      .map(change => change.file)
      .join(' ');
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// Get the project path that changed
function getChangedProjects(changedFiles) {
  const changedProjectFolders = new Set();
  const changedProjects = new Set();

  withProjectFolder(changedFiles).forEach(({ projectFolder, packageName }) => {
    if (!changedProjectFolders.has(projectFolder)) {
      changedProjectFolders.add(projectFolder);
      changedProjects.add({
        packageName,
        projectFolder,
      });
    }
  });

  return [...changedProjects];
}

const groupChangedFilesByProject = changedFiles => {
  const changedFilesMap = withProjectFolder(changedFiles);
  const result = changedFilesMap.reduce((pre, cur) => {
    pre[cur.packageName] ||= [];
    pre[cur.packageName].push(cur.file);
    return pre;
  }, {});
  return result;
};

exports.excludeIgnoredFiles = excludeIgnoredFiles;
exports.getRushConfiguration = getRushConfiguration;
exports.getChangedProjects = getChangedProjects;
exports.groupChangedFilesByProject = groupChangedFilesByProject;
