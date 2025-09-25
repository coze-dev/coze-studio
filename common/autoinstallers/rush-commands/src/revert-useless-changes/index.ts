/**
 * Main entry point for revert-useless-changes tool
 */

// Export main types
export type {
  Config,
  Rule,
  RuleResult,
  FileAnalysis,
  AnalysisReport,
  RevertError,
  ChangeType
} from './types';

// Export main orchestrator functions
export { execute } from './orchestrator';

// Export CLI
export { main as runCLI } from './cli';

// Export reporter functions
export * as reporter from './reporter';

// Export rules and rule registry
export * from './rules';

// Export utilities
export * as gitUtils from './utils/git';
export * as fileUtils from './utils/file';

// Export configuration constants
export { FILE_PATTERNS } from './config';

/**
 * Programmatic API for analyzing and reverting files
 */
export async function analyzeAndRevert(config: import('./types').Config): Promise<import('./types').AnalysisReport> {
  const { execute } = await import('./orchestrator');
  return execute(config);
}

/**
 * Default export for CLI usage
 */
export default { analyzeAndRevert };