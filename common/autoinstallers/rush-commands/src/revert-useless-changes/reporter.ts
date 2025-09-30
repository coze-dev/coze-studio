import { AnalysisReport, Config } from './types';
import { toRelativePath } from './utils/file';
import chalk from 'chalk';

/**
 * Generate and display the analysis report
 */
export const generateReport = (report: AnalysisReport, config: Config): void => {
  if (config.json) {
    outputJson(report);
  } else {
    outputConsole(report, config);
  }
};

/**
 * Log progress during analysis
 */
export const logProgress = (message: string, config: Config): void => {
  if (!config.json) {
    console.log(chalk.blue('🔍'), message);
  }
};

/**
 * Log verbose messages
 */
export const logVerbose = (message: string, config: Config): void => {
  if (config.verbose && !config.json) {
    console.log(chalk.gray(`[VERBOSE] ${message}`));
  }
};

/**
 * Log error messages
 */
export const logError = (message: string, config: Config): void => {
  if (!config.json) {
    console.error(chalk.red('❌'), message);
  }
};

/**
 * Log warning messages
 */
export const logWarning = (message: string, config: Config): void => {
  if (!config.json) {
    console.warn(chalk.yellow('⚠️'), message);
  }
};

/**
 * Log success messages
 */
export const logSuccess = (message: string, config: Config): void => {
  if (!config.json) {
    console.log(chalk.green('✅'), message);
  }
};

/**
 * Output results as JSON
 */
const outputJson = (report: AnalysisReport): void => {
  console.log(JSON.stringify(report, null, 2));
};

/**
 * Output results to console with formatting
 */
const outputConsole = (report: AnalysisReport, config: Config): void => {
  console.log();
  console.log(chalk.bold('📊 ANALYSIS REPORT'));
  console.log('='.repeat(60));

  // Summary
  outputSummary(report);

  // File categorization
  outputFileCategorization(report, config);

  // Revert results (if not dry run)
  if (!config.dryRun) {
    outputRevertResults(report, config);
  }

  // Footer
  outputFooter(report, config);
};

/**
 * Output summary statistics
 */
const outputSummary = (report: AnalysisReport): void => {
  console.log(chalk.bold('\n📈 Summary:'));
  console.log(`${chalk.blue('📁 Total files analyzed:')} ${report.summary.totalFiles}`);
  console.log(`${chalk.green('🔄 Revertable files:')} ${report.summary.revertableFiles}`);
  console.log(`  ${chalk.cyan('├─ Whitespace-only:')} ${report.summary.whitespaceOnlyFiles}`);
  console.log(`  ${chalk.cyan('└─ Comment-only:')} ${report.summary.commentOnlyFiles}`);
  console.log(`${chalk.yellow('📝 Files with changes:')} ${report.summary.unchangedFiles}`);
  console.log(`${chalk.red('🗑️  Deleted files:')} ${report.summary.deletedFiles}`);
  console.log(`${chalk.red('❌ Error files:')} ${report.summary.errorFiles}`);
};

/**
 * Output file categorization
 */
const outputFileCategorization = (report: AnalysisReport, config: Config): void => {
  const revertableFiles = report.fileAnalyses.filter(f => f.shouldRevert);
  const codeChangeFiles = report.fileAnalyses.filter(f => !f.shouldRevert && f.exists);

  if (revertableFiles.length > 0) {
    console.log(chalk.bold('\n🔄 REVERTABLE FILES:'));
    console.log('-'.repeat(60));
    revertableFiles.slice(0, 15).forEach((analysis, index) => {
      const relativePath = toRelativePath(analysis.filePath, config.cwd);
      const ruleType = analysis.matchedRule === 'whitespace-only' ? '🔤 Whitespace' : '💬 Comments';
      console.log(`${(index + 1).toString().padStart(3)}. ${ruleType} - ${relativePath}`);
    });

    if (revertableFiles.length > 15) {
      console.log(`... and ${revertableFiles.length - 15} more files`);
    }
  }

  if (codeChangeFiles.length > 0) {
    console.log(chalk.bold('\n📝 FILES WITH CODE CHANGES (keeping):'));
    console.log('-'.repeat(60));
    codeChangeFiles.slice(0, 10).forEach((analysis, index) => {
      const relativePath = toRelativePath(analysis.filePath, config.cwd);
      console.log(`${(index + 1).toString().padStart(3)}. ${relativePath}`);
    });

    if (codeChangeFiles.length > 10) {
      console.log(`... and ${codeChangeFiles.length - 10} more files`);
    }
  }

  const deletedFiles = report.fileAnalyses.filter(f => !f.exists);
  if (deletedFiles.length > 0) {
    console.log(chalk.bold('\n🗑️  DELETED FILES:'));
    console.log('-'.repeat(60));
    deletedFiles.forEach((analysis, index) => {
      const relativePath = toRelativePath(analysis.filePath, config.cwd);
      console.log(`${(index + 1).toString().padStart(3)}. ${relativePath}`);
    });
  }

  const errorFiles = report.fileAnalyses.filter(f =>
    f.ruleResults.some(r => r.error)
  );
  if (errorFiles.length > 0) {
    console.log(chalk.bold('\n❌ ERROR FILES:'));
    console.log('-'.repeat(60));
    errorFiles.forEach((analysis, index) => {
      const relativePath = toRelativePath(analysis.filePath, config.cwd);
      const errors = analysis.ruleResults.filter(r => r.error).map(r => r.error).join('; ');
      console.log(`${(index + 1).toString().padStart(3)}. ${relativePath}`);
      console.log(`     Error: ${errors}`);
    });
  }
};

/**
 * Output revert operation results
 */
const outputRevertResults = (report: AnalysisReport, config: Config): void => {
  if (report.revertedFiles.length > 0 || report.revertErrors.length > 0) {
    console.log(chalk.bold('\n🔄 REVERT RESULTS:'));
    console.log('='.repeat(60));

    if (report.revertedFiles.length > 0) {
      console.log(`${chalk.green('✅ Successfully reverted:')} ${report.revertedFiles.length} files`);
      if (config.verbose) {
        report.revertedFiles.forEach(file => {
          const relativePath = toRelativePath(file, config.cwd);
          console.log(`  - ${relativePath}`);
        });
      }
    }

    if (report.revertErrors.length > 0) {
      console.log(`${chalk.red('❌ Failed to revert:')} ${report.revertErrors.length} files`);
      report.revertErrors.forEach(({ file, error }) => {
        const relativePath = toRelativePath(file, config.cwd);
        console.log(`  - ${relativePath}: ${error}`);
      });
    }
  }
};

/**
 * Output footer with recommendations
 */
const outputFooter = (report: AnalysisReport, config: Config): void => {
  console.log(chalk.bold('\n🎯 RECOMMENDATIONS:'));
  console.log('='.repeat(60));

  if (config.dryRun && report.summary.revertableFiles > 0) {
    console.log(chalk.green(`✅ Found ${report.summary.revertableFiles} files that can be safely reverted`));
    console.log(chalk.cyan('💡 Run without --dry-run to actually revert these files'));
  } else if (!config.dryRun && report.revertedFiles.length > 0) {
    console.log(chalk.green(`✅ Successfully reverted ${report.revertedFiles.length} files`));
    console.log(chalk.cyan("💡 Run 'git status' to see remaining changes"));
  }

  if (report.summary.unchangedFiles > 0) {
    console.log(chalk.yellow(`⚠️  ${report.summary.unchangedFiles} files have actual code/content changes and were kept`));
  }

  if (report.summary.errorFiles > 0) {
    console.log(chalk.red(`❌ ${report.summary.errorFiles} files had analysis errors`));
  }

  console.log();
};