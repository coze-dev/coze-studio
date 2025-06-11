import type { RushConfiguration, RushSession } from '@rushstack/rush-sdk';
import { logger } from '@coze-arch/rush-logger';

import { parseTagsLevel, isValidLevel, isDepLevelMatch } from './utils';

const PLUGIN_NAME = 'RushDepLevelPlugin';

export default class RushDepLevelPlugin {
  public apply(
    rushSession: RushSession,
    rushConfiguration: RushConfiguration,
  ): void {
    rushSession.hooks.beforeInstall.tap(PLUGIN_NAME, () => {
      const startTime = process.hrtime();
      const { projects } = rushConfiguration;

      logger.info(
        `[${PLUGIN_NAME}] Validating dependency levels for ${projects.length} projects...`,
      );

      for (const project of projects) {
        // find workspace dependencies
        const workspaceDependencies = [...project.dependencyProjects];

        // Get project tags
        const projectTags = project.tags || [];
        const projectLevel = parseTagsLevel(projectTags);

        if (!isValidLevel(projectLevel)) {
          const errorMessage = `[${PLUGIN_NAME}] ${project.packageName} 没有配置level tag，请在rush.json中配置tags字段`;
          logger.error(errorMessage);
          process.exit(1);
        }

        // Check each workspace dependency
        for (const depProject of workspaceDependencies) {
          const depLevel = parseTagsLevel(depProject.tags);

          if (!isValidLevel(depLevel)) {
            const errorMessage = `[${PLUGIN_NAME}] ${project.packageName} 依赖的 ${depProject.packageName} 没有配置level tag，请在rush.json中配置tags字段。`;
            logger.error(errorMessage);
            process.exit(1);
          }

          // Validate dependency level
          if (!isDepLevelMatch(projectLevel, depLevel)) {
            const errorMessage = `[${PLUGIN_NAME}] ${project.packageName} 的依赖级别不匹配：项目级别为level-${projectLevel}，依赖 "${depProject.packageName}" 级别为level-${depLevel}。项目只能依赖相同或更低级别的包，请在rush.json调整tags字段配置。`;
            logger.error(errorMessage);
            process.exit(1);
          }
        }
      }

      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
      logger.info(
        `[${PLUGIN_NAME}] Dependency level validation completed in ${totalTimeMs}ms`,
      );
    });
  }
}
