import { Config, AnalysisReport, FileAnalysis, RevertError } from './types';
import { getRulesForFile } from './rules';
import { getChangedFiles, revertFile } from './utils/git';
import { toAbsolutePath, toRelativePath, exists, matchesPattern } from './utils/file';
import * as reporter from './reporter';

/**
 * Execute the full analysis and revert workflow
 */
export const execute = async (config: Config): Promise<AnalysisReport> => {
  reporter.logProgress('Starting analysis...', config);

  // Get list of changed files from Git
  const changedFiles = getChangedFilesFiltered(config);
  reporter.logProgress(`Found ${changedFiles.length} changed files`, config);

  if (changedFiles.length === 0) {
    reporter.logWarning('No changed files found. Nothing to analyze.', config);
    return createEmptyReport(config);
  }

  // Analyze each file
  const fileAnalyses = await analyzeFiles(changedFiles, config);

  // Generate report
  const report = generateReport(fileAnalyses, config);

  // Perform reverts if not dry run
  const updatedReport = !config.dryRun
    ? await performReverts(report, config)
    : report;

  // Display results
  reporter.generateReport(updatedReport, config);

  return updatedReport;
};

/**
 * Get list of changed files from Git with filtering applied
 */
const getChangedFilesFiltered = (config: Config): string[] => {
  try {
    const files = getChangedFiles({ cwd: config.cwd });

    // Filter out files based on patterns if specified
    let filteredFiles = files;

    if (config.include && config.include.length > 0) {
      filteredFiles = filteredFiles.filter(file =>
        matchesPattern(file, config.include!)
      );
    }

    if (config.exclude && config.exclude.length > 0) {
      filteredFiles = filteredFiles.filter(file =>
        !matchesPattern(file, config.exclude!)
      );
    }

    return filteredFiles;
  } catch (error) {
    reporter.logError(`Failed to get changed files: ${error instanceof Error ? error.message : String(error)}`, config);
    return [];
  }
};

/**
 * Analyze all files using applicable rules
 */
const analyzeFiles = async (filePaths: string[], config: Config): Promise<FileAnalysis[]> => {
  const analyses: FileAnalysis[] = [];

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    reporter.logProgress(`Analyzing file ${i + 1}/${filePaths.length}: ${toRelativePath(filePath, config.cwd)}`, config);

    try {
      const analysis = await analyzeFile(filePath, config);
      analyses.push(analysis);
    } catch (error) {
      reporter.logError(`Failed to analyze ${filePath}: ${error instanceof Error ? error.message : String(error)}`, config);

      // Create error analysis
      analyses.push(createErrorAnalysis(filePath, error));
    }
  }

  return analyses;
};

/**
 * Analyze a single file using applicable rules
 */
const analyzeFile = async (filePath: string, config: Config): Promise<FileAnalysis> => {
  const absolutePath = toAbsolutePath(filePath, config.cwd);
  const fileExists = exists(absolutePath);

  reporter.logVerbose(`Checking if file exists: ${absolutePath} = ${fileExists}`, config);

  if (!fileExists) {
    return createDeletedFileAnalysis(absolutePath);
  }

  // Get rules that apply to this file
  const applicableRules = getRulesForFile(absolutePath);
  reporter.logVerbose(`Found ${applicableRules.length} applicable rules for ${absolutePath}`, config);

  if (applicableRules.length === 0) {
    return createNoRulesAnalysis(absolutePath);
  }

  // Apply each rule
  const ruleResults = [];
  let shouldRevert = false;
  let matchedRule: string | undefined = undefined;

  for (const { rule, analyzer } of applicableRules) {
    reporter.logVerbose(`Applying rule: ${rule.name}`, config);

    try {
      const result = await analyzer(absolutePath, config);
      ruleResults.push(result);

      // If any rule says we should revert, we should revert
      if (result.shouldRevert && !shouldRevert) {
        shouldRevert = true;
        matchedRule = rule.name;
      }
    } catch (error) {
      reporter.logVerbose(`Rule ${rule.name} failed: ${error}`, config);
      ruleResults.push(createRuleErrorResult(absolutePath, rule.name, error));
    }
  }

  return {
    filePath: absolutePath,
    exists: true,
    shouldRevert,
    matchedRule,
    ruleResults
  };
};

/**
 * Create analysis for a deleted file
 */
const createDeletedFileAnalysis = (filePath: string): FileAnalysis => ({
  filePath,
  exists: false,
  shouldRevert: false,
  matchedRule: undefined,
  ruleResults: [{
    filePath,
    ruleName: 'file-deleted',
    shouldRevert: false,
    reason: 'File was deleted'
  }]
});

/**
 * Create analysis for a file with no applicable rules
 */
const createNoRulesAnalysis = (filePath: string): FileAnalysis => ({
  filePath,
  exists: true,
  shouldRevert: false,
  matchedRule: undefined,
  ruleResults: [{
    filePath,
    ruleName: 'no-rules',
    shouldRevert: false,
    reason: 'No applicable rules found for this file type'
  }]
});

/**
 * Create error analysis for a file that failed to analyze
 */
const createErrorAnalysis = (filePath: string, error: unknown): FileAnalysis => ({
  filePath,
  exists: exists(filePath),
  shouldRevert: false,
  matchedRule: undefined,
  ruleResults: [{
    filePath,
    ruleName: 'analysis-error',
    shouldRevert: false,
    reason: 'Analysis failed',
    error: error instanceof Error ? error.message : String(error)
  }]
});

/**
 * Create error result for a rule that failed
 */
const createRuleErrorResult = (filePath: string, ruleName: string, error: unknown) => ({
  filePath,
  ruleName,
  shouldRevert: false,
  reason: 'Rule execution failed',
  error: error instanceof Error ? error.message : String(error)
});

/**
 * Generate analysis report from file analyses
 */
const generateReport = (fileAnalyses: FileAnalysis[], config: Config): AnalysisReport => {
  const summary = {
    totalFiles: fileAnalyses.length,
    revertableFiles: fileAnalyses.filter(f => f.shouldRevert).length,
    whitespaceOnlyFiles: fileAnalyses.filter(f => f.matchedRule === 'whitespace-only').length,
    commentOnlyFiles: fileAnalyses.filter(f => f.matchedRule === 'ast-comment-only').length,
    unchangedFiles: fileAnalyses.filter(f => !f.shouldRevert && f.exists).length,
    deletedFiles: fileAnalyses.filter(f => !f.exists).length,
    errorFiles: fileAnalyses.filter(f => f.ruleResults.some(r => r.error)).length
  };

  return {
    timestamp: new Date().toISOString(),
    config,
    summary,
    fileAnalyses,
    revertedFiles: [],
    revertErrors: []
  };
};

/**
 * Perform file reverts based on analysis
 */
const performReverts = async (report: AnalysisReport, config: Config): Promise<AnalysisReport> => {
  const filesToRevert = report.fileAnalyses
    .filter(analysis => analysis.shouldRevert)
    .map(analysis => analysis.filePath);

  if (filesToRevert.length === 0) {
    reporter.logProgress('No files to revert.', config);
    return report;
  }

  reporter.logProgress(`Reverting ${filesToRevert.length} files...`, config);

  const revertedFiles: string[] = [];
  const revertErrors: RevertError[] = [];

  for (const filePath of filesToRevert) {
    try {
      reporter.logVerbose(`Reverting: ${toRelativePath(filePath, config.cwd)}`, config);

      revertFile(filePath, { cwd: config.cwd });
      revertedFiles.push(filePath);

      reporter.logVerbose(`Successfully reverted: ${filePath}`, config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      revertErrors.push({ file: filePath, error: errorMessage });

      reporter.logError(`Failed to revert ${filePath}: ${errorMessage}`, config);
    }
  }

  if (revertedFiles.length > 0) {
    reporter.logSuccess(`Successfully reverted ${revertedFiles.length} files`, config);
  }

  if (revertErrors.length > 0) {
    reporter.logWarning(`Failed to revert ${revertErrors.length} files`, config);
  }

  // Return updated report
  return {
    ...report,
    revertedFiles,
    revertErrors
  };
};

/**
 * Create an empty report for when no files are found
 */
const createEmptyReport = (config: Config): AnalysisReport => ({
  timestamp: new Date().toISOString(),
  config,
  summary: {
    totalFiles: 0,
    revertableFiles: 0,
    whitespaceOnlyFiles: 0,
    commentOnlyFiles: 0,
    unchangedFiles: 0,
    deletedFiles: 0,
    errorFiles: 0
  },
  fileAnalyses: [],
  revertedFiles: [],
  revertErrors: []
});