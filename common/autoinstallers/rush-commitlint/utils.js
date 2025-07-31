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
      // If the registered package information is not found, it is considered a generic file change
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
