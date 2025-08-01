/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
