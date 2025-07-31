import {
  ProcessingReport,
  ProcessingStats,
  FileProcessingDetail,
} from '../types/index.js';

/**
 * 报告收集器类
 */
export class ReportCollector {
  private stats: ProcessingStats = {
    totalFiles: 0,
    processedFiles: 0,
    translatedComments: 0,
    skippedFiles: 0,
    errors: [],
    startTime: Date.now(),
    endTime: 0,
  };

  private fileDetails: Map<string, FileProcessingDetail> = new Map();

  /**
   * 记录文件处理开始
   */
  recordFileStart(filePath: string): void {
    this.stats.totalFiles++;
    this.fileDetails.set(filePath, {
      file: filePath,
      commentCount: 0,
      status: 'processing',
      startTime: Date.now(),
    });
  }

  /**
   * 记录文件处理完成
   */
  recordFileComplete(filePath: string, commentCount: number): void {
    const detail = this.fileDetails.get(filePath);
    if (detail) {
      detail.status = 'success';
      detail.commentCount = commentCount;
      detail.endTime = Date.now();
      this.stats.processedFiles++;
      this.stats.translatedComments += commentCount;
    }
  }

  /**
   * 记录文件跳过
   */
  recordFileSkipped(filePath: string, reason?: string): void {
    const detail = this.fileDetails.get(filePath);
    if (detail) {
      detail.status = 'skipped';
      detail.errorMessage = reason;
      detail.endTime = Date.now();
      this.stats.skippedFiles++;
    }
  }

  /**
   * 记录处理错误
   */
  recordError(filePath: string, error: Error): void {
    const detail = this.fileDetails.get(filePath);
    if (detail) {
      detail.status = 'error';
      detail.errorMessage = error.message;
      detail.endTime = Date.now();
    }
    this.stats.errors.push({ file: filePath, error: error.message });
  }

  /**
   * 完成统计
   */
  finalize(): void {
    this.stats.endTime = Date.now();
  }

  /**
   * 获取统计信息
   */
  getStats(): ProcessingStats {
    return { ...this.stats };
  }

  /**
   * 获取文件详情
   */
  getFileDetails(): FileProcessingDetail[] {
    return Array.from(this.fileDetails.values());
  }

  /**
   * 生成完整报告
   */
  generateReport(): ProcessingReport {
    this.finalize();
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;

    return {
      stats: this.getStats(),
      details: this.getFileDetails(),
      duration,
    };
  }

  /**
   * 重置收集器
   */
  reset(): void {
    this.stats = {
      totalFiles: 0,
      processedFiles: 0,
      translatedComments: 0,
      skippedFiles: 0,
      errors: [],
      startTime: Date.now(),
      endTime: 0,
    };
    this.fileDetails.clear();
  }
}

/**
 * 生成控制台报告
 */
export const generateConsoleReport = (report: ProcessingReport): string => {
  const { stats, duration } = report;
  const successRate =
    stats.totalFiles > 0
      ? ((stats.processedFiles / stats.totalFiles) * 100).toFixed(1)
      : '0';

  let output = `
📊 翻译处理报告
==================
总文件数: ${stats.totalFiles}
处理成功: ${stats.processedFiles}
跳过文件: ${stats.skippedFiles}
翻译注释: ${stats.translatedComments}
错误数量: ${stats.errors.length}
成功率: ${successRate}%
处理时间: ${duration.toFixed(2)}秒
`;

  if (stats.errors.length > 0) {
    output += '\n❌ 错误详情:\n';
    stats.errors.forEach(error => {
      output += `  ${error.file}: ${error.error}\n`;
    });
  } else {
    output += '\n✅ 处理完成，无错误';
  }

  return output;
};

/**
 * 生成Markdown报告
 */
export const generateMarkdownReport = (report: ProcessingReport): string => {
  const { stats, details, duration } = report;
  const successRate =
    stats.totalFiles > 0
      ? ((stats.processedFiles / stats.totalFiles) * 100).toFixed(1)
      : '0';

  let markdown = `# 中文注释翻译报告

## 📊 统计概览

| 指标 | 数值 |
|------|------|
| 总文件数 | ${stats.totalFiles} |
| 处理成功 | ${stats.processedFiles} |
| 跳过文件 | ${stats.skippedFiles} |
| 翻译注释 | ${stats.translatedComments} |
| 错误数量 | ${stats.errors.length} |
| 成功率 | ${successRate}% |
| 处理时间 | ${duration.toFixed(2)}秒 |

## 📁 文件详情

| 文件路径 | 状态 | 注释数量 | 耗时(ms) | 备注 |
|----------|------|----------|----------|------|
`;

  details.forEach(detail => {
    const duration =
      detail.endTime && detail.startTime
        ? detail.endTime - detail.startTime
        : 0;
    const status =
      detail.status === 'success'
        ? '✅'
        : detail.status === 'error'
          ? '❌'
          : detail.status === 'skipped'
            ? '⏭️'
            : '🔄';

    markdown += `| ${detail.file} | ${status} | ${detail.commentCount} | ${duration} | ${detail.errorMessage || '-'} |\n`;
  });

  if (stats.errors.length > 0) {
    markdown += '\n## ❌ 错误详情\n\n';
    stats.errors.forEach((error, index) => {
      markdown += `${index + 1}. **${error.file}**\n   \`\`\`\n   ${error.error}\n   \`\`\`\n\n`;
    });
  }

  return markdown;
};

/**
 * 生成JSON报告
 */
export const generateJsonReport = (report: ProcessingReport): string => {
  return JSON.stringify(report, null, 2);
};

/**
 * 根据格式生成报告
 */
export const generateReport = (
  report: ProcessingReport,
  format: 'json' | 'markdown' | 'console' = 'console',
): string => {
  switch (format) {
    case 'json':
      return generateJsonReport(report);
    case 'markdown':
      return generateMarkdownReport(report);
    case 'console':
    default:
      return generateConsoleReport(report);
  }
};

/**
 * 保存报告到文件
 */
export const saveReportToFile = async (
  report: ProcessingReport,
  filePath: string,
  format: 'json' | 'markdown' | 'console' = 'json',
): Promise<void> => {
  const content = generateReport(report, format);
  const fs = await import('fs/promises');
  await fs.writeFile(filePath, content, 'utf-8');
};

/**
 * 在控制台显示实时进度
 */
export class ProgressDisplay {
  private total: number = 0;
  private current: number = 0;
  private startTime: number = Date.now();

  constructor(total: number) {
    this.total = total;
  }

  /**
   * 更新进度
   */
  update(current: number, currentFile?: string): void {
    this.current = current;
    const percentage = ((current / this.total) * 100).toFixed(1);
    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = current / elapsed;
    const eta = speed > 0 ? (this.total - current) / speed : 0;

    let line = `进度: ${current}/${this.total} (${percentage}%) | 耗时: ${elapsed.toFixed(1)}s`;

    if (eta > 0) {
      line += ` | 预计剩余: ${eta.toFixed(1)}s`;
    }

    if (currentFile) {
      line += ` | 当前: ${currentFile}`;
    }

    // 清除当前行并输出新进度
    process.stdout.write(
      '\r' + ' '.repeat(process.stdout.columns || 80) + '\r',
    );
    process.stdout.write(line);
  }

  /**
   * 完成进度显示
   */
  complete(): void {
    process.stdout.write('\n');
  }
}
