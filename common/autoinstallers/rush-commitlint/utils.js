const { RushConfiguration } = require('@rushstack/rush-sdk')

const getRushConfiguration = (function () {
  let rushConfiguration = null
  return function () {
    // eslint-disable-next-line
    return (rushConfiguration ||= RushConfiguration.loadFromDefaultLocation({
      startingFolder: process.cwd(),
    }))
  }
})()

function getChangedPackages(changedFiles) {
  const changedPackages = new Set()

  try {
    const rushConfiguration = getRushConfiguration()
    const { rushJsonFolder } = rushConfiguration
    const lookup = rushConfiguration.getProjectLookupForRoot(rushJsonFolder)
    for (const file of changedFiles) {
      const project = lookup.findChildPath(file)
      // 如果没找到注册的包信息，则认为是通用文件更改
      const packageName = project?.packageName || 'misc'
      if (!changedPackages.has(packageName)) {
        changedPackages.add(packageName)
      }
    }
  } catch (e) {
    console.error(e)
    throw e
  }

  return changedPackages
}

exports.getChangedPackages = getChangedPackages
exports.getRushConfiguration = getRushConfiguration
