import { RuleResult, Config, Rule } from '../types';
import { FILE_PATTERNS } from '../config';
import { hasOnlyWhitespaceChanges } from '../utils/git';
import { exists } from '../utils/file';

/**
 * Rule definition for detecting whitespace-only changes
 */
export const WHITESPACE_RULE: Rule = {
  name: 'whitespace-only',
  description: 'Detects files that have only whitespace changes (spaces, tabs, newlines)',
  filePatterns: FILE_PATTERNS.ALL_FILES
} as const;

/**
 * Create a result object for the whitespace rule
 */
const createResult = (
  filePath: string,
  shouldRevert: boolean,
  reason?: string,
  error?: string
): RuleResult => ({
  filePath,
  ruleName: WHITESPACE_RULE.name,
  shouldRevert,
  reason,
  error
});

/**
 * Log verbose messages if enabled
 */
const log = (message: string, config: Config): void => {
  if (config.verbose) {
    console.log(`[${WHITESPACE_RULE.name}] ${message}`);
  }
};

/**
 * Analyze a file for whitespace-only changes
 */
export const analyzeWhitespaceRule = async (filePath: string, config: Config): Promise<RuleResult> => {
  log(`Analyzing file for whitespace changes: ${filePath}`, config);

  try {
    // Check if file exists
    if (!exists(filePath)) {
      return createResult(filePath, false, 'File does not exist');
    }

    const hasOnlyWhitespace = hasOnlyWhitespaceChanges(filePath, { cwd: config.cwd });

    if (hasOnlyWhitespace) {
      return createResult(
        filePath,
        true,
        'File has only whitespace changes (spaces, tabs, newlines)'
      );
    } else {
      return createResult(
        filePath,
        false,
        'File has non-whitespace changes'
      );
    }
  } catch (error) {
    return createResult(
      filePath,
      false,
      'Failed to check whitespace changes',
      error instanceof Error ? error.message : String(error)
    );
  }
};