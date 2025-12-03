/**
 * Configuration options for the revert-useless-changes tool
 */
export interface Config {
  /** Working directory to analyze */
  cwd: string;
  /** Only analyze, don't actually revert files */
  dryRun: boolean;
  /** Enable verbose output */
  verbose: boolean;
  /** Output results as JSON */
  json: boolean;
  /** File patterns to include in analysis */
  include?: string[];
  /** File patterns to exclude from analysis */
  exclude?: string[];
}

/**
 * Result of analyzing a single file with a rule
 */
export interface RuleResult {
  /** The file that was analyzed */
  filePath: string;
  /** Name of the rule that was applied */
  ruleName: string;
  /** Whether this rule matched (file should be reverted) */
  shouldRevert: boolean;
  /** Optional reason why the rule matched or didn't match */
  reason?: string;
  /** Any error that occurred during analysis */
  error?: string;
}

/**
 * Analysis results for a single file across all applicable rules
 */
export interface FileAnalysis {
  /** The file that was analyzed */
  filePath: string;
  /** Results from each rule that was applied */
  ruleResults: RuleResult[];
  /** Whether any rule matched (file should be reverted) */
  shouldRevert: boolean;
  /** The rule that matched (if any) */
  matchedRule?: string;
  /** Whether the file exists (not deleted) */
  exists: boolean;
}

/**
 * Overall analysis report
 */
export interface AnalysisReport {
  /** Timestamp when analysis was performed */
  timestamp: string;
  /** Configuration used for analysis */
  config: Config;
  /** Summary statistics */
  summary: {
    totalFiles: number;
    revertableFiles: number;
    whitespaceOnlyFiles: number;
    commentOnlyFiles: number;
    deletedFiles: number;
    errorFiles: number;
    unchangedFiles: number;
  };
  /** Detailed analysis for each file */
  fileAnalyses: FileAnalysis[];
  /** Files that were successfully reverted (if not dry run) */
  revertedFiles: string[];
  /** Files that failed to revert */
  revertErrors: RevertError[];
}

/**
 * Error information for files that failed to revert
 */
export interface RevertError {
  /** File that failed to revert */
  file: string;
  /** Error message */
  error: string;
}

/**
 * File change type classification
 */
export enum ChangeType {
  WHITESPACE_ONLY = 'whitespace-only',
  COMMENT_ONLY = 'comment-only',
  CODE_CHANGES = 'code-changes',
  DELETED = 'deleted',
  ERROR = 'error',
  UNCHANGED = 'unchanged'
}

/**
 * Rule definition for analyzing files
 */
export interface Rule {
  /** Unique name of the rule */
  readonly name: string;
  /** Description of what the rule detects */
  readonly description: string;
  /** File patterns this rule applies to (glob patterns) */
  readonly filePatterns: readonly string[];
}

/**
 * Function type for analyzing files with a rule
 */
export type RuleAnalyzer = (filePath: string, config: Config) => Promise<RuleResult>;

/**
 * Options for git operations
 */
export interface GitOptions {
  /** Working directory for git operations */
  cwd: string;
  /** Git reference to compare against (default: HEAD) */
  ref?: string;
}