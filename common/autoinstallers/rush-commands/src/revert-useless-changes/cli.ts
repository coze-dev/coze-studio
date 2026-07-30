#!/usr/bin/env node

import { Command } from 'commander';
import { Config } from './types';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { validateGitRepository } from './utils/git';
import { execute } from './orchestrator';

/**
 * Command line interface for the revert-useless-changes tool
 */
export async function main(): Promise<void> {
  const program = new Command();

  program
    .name('revert-useless-changes')
    .description(
      'Analyze and revert files with only whitespace or comment changes',
    )
    .version('1.0.0')
    .option('--cwd <path>', 'Working directory to analyze', process.cwd())
    .option(
      '-d, --dry-run',
      'Show what would be reverted without actually reverting',
      false,
    )
    .option('-v, --verbose', 'Show verbose output during analysis', false)
    .option('-j, --json', 'Output results in JSON format', false)
    .option(
      '--include <patterns...>',
      'File patterns to include (glob patterns)',
      [],
    )
    .option(
      '--exclude <patterns...>',
      'File patterns to exclude (glob patterns)',
      ['**/node_modules/**', '**/tmp/**', '**/.git/**'],
    )
    .addHelpText(
      'after',
      `
Examples:
  $ revert-useless-changes                           Analyze current directory and revert files
  $ revert-useless-changes --dry-run                Show what would be reverted without reverting
  $ revert-useless-changes --cwd /path/to/project   Analyze a specific directory
  $ revert-useless-changes --verbose                Show detailed analysis information
  $ revert-useless-changes --json                   Output results in JSON format
  $ revert-useless-changes --include "**/*.ts" --include "**/*.js"  Only analyze TS/JS files
  $ revert-useless-changes --exclude "**/test/**"   Exclude test directories from analysis
`,
    );

  program.parse();
  const options = program.opts();

  // Create configuration from command line arguments
  const config: Config = {
    cwd: resolve(options.cwd),
    dryRun: options.dryRun,
    verbose: options.verbose,
    json: options.json,
    include:
      options.include && options.include.length > 0
        ? options.include
        : undefined,
    exclude:
      options.exclude && options.exclude.length > 0
        ? options.exclude
        : undefined,
  };

  try {
    // Validate working directory exists
    if (!existsSync(config.cwd)) {
      console.error(`Error: Directory does not exist: ${config.cwd}`);
      process.exit(1);
    }

    // Check if we're in a git repository
    validateGitRepository(config.cwd);

    // Run the analysis workflow
    const report = await execute(config);

    // Set exit code based on results
    if (report.revertErrors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(
      'Fatal error:',
      error instanceof Error ? error.message : String(error),
    );
    if (config.verbose && error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    console.error('CLI execution failed:', error);
    process.exit(1);
  });
}
