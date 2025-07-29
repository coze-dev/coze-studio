#!/usr/bin/env node

import { createProgram, parseOptions, showHelp } from './cli/command';
import { loadConfig, validateConfig, printConfigInfo } from './cli/config';
import { scanSourceFiles } from './modules/file-scan';
import { detectChineseInFiles } from './modules/chinese-detection';
import { TranslationService } from './modules/translation';
import {
  createReplacements,
  replaceCommentsInFile,
} from './modules/file-replacement';
import {
  ReportCollector,
  ProgressDisplay,
  generateReport,
  saveReportToFile,
} from './modules/report';
import { FileScanConfig } from './types/index';

/**
 * 主处理函数
 */
async function processRepository(
  rootPath: string,
  extensions: string[],
  config: any,
  dryRun: boolean = false,
  verbose: boolean = false,
): Promise<void> {
  const reportCollector = new ReportCollector();

  try {
    console.log('🚀 开始处理代码仓库...');

    if (verbose) {
      printConfigInfo(config, true);
    }

    // 1. 扫描源文件
    console.log('\n📁 扫描源文件...');
    const scanConfig: FileScanConfig = {
      root: rootPath,
      extensions,
      ignorePatterns: config.git.ignorePatterns,
      includeUntracked: config.git.includeUntracked,
    };

    const filesResult = await scanSourceFiles(scanConfig);
    if (!filesResult.success) {
      throw new Error(`文件扫描失败: ${filesResult.error}`);
    }

    const sourceFiles = filesResult.data;
    console.log(`✅ 找到 ${sourceFiles.length} 个源文件`);

    if (sourceFiles.length === 0) {
      console.log('⚠️  未找到任何源文件，请检查根目录和文件扩展名设置');
      return;
    }

    // 2. 检测中文注释
    console.log('\n🔍 检测中文注释...');
    const filesWithComments = detectChineseInFiles(sourceFiles);

    const totalComments = filesWithComments.reduce(
      (sum, file) => sum + file.chineseComments.length,
      0,
    );

    console.log(
      `✅ 在 ${filesWithComments.length} 个文件中找到 ${totalComments} 条中文注释`,
    );

    if (totalComments === 0) {
      console.log('✅ 未发现中文注释，无需处理');
      return;
    }

    // 3. 初始化翻译服务
    console.log('\n🤖 初始化翻译服务...');
    const translationService = new TranslationService(config.translation);

    // 4. 处理文件
    console.log('\n🔄 开始翻译处理...');
    const progressDisplay = new ProgressDisplay(filesWithComments.length);

    for (let i = 0; i < filesWithComments.length; i++) {
      const fileWithComments = filesWithComments[i];
      const { file, chineseComments } = fileWithComments;

      progressDisplay.update(i + 1, file.path);
      reportCollector.recordFileStart(file.path);

      try {
        // 翻译注释
        const translations = await translationService.batchTranslate(
          chineseComments,
          config.translation.concurrency,
        );

        if (verbose) {
          console.log(`\n📝 ${file.path}:`);
          translations.forEach((translation, index) => {
            console.log(
              `  ${index + 1}. "${translation.original}" → "${translation.translated}"`,
            );
          });
        }

        // 如果不是干运行模式，则替换文件内容
        if (!dryRun) {
          const replacements = createReplacements(
            file,
            chineseComments,
            translations,
          );
          const operation = { file: file.path, replacements };

          const result = await replaceCommentsInFile(
            file,
            operation,
          );

          if (!result.success) {
            throw new Error(result.error || '文件替换失败');
          }
        }

        reportCollector.recordFileComplete(file.path, chineseComments.length);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`\n❌ 处理文件失败: ${file.path} - ${errorMessage}`);
        reportCollector.recordError(
          file.path,
          error instanceof Error ? error : new Error(errorMessage),
        );
      }
    }

    progressDisplay.complete();

    // 5. 生成报告
    console.log('\n📊 生成处理报告...');
    const report = reportCollector.generateReport();

    if (dryRun) {
      console.log('\n🔍 预览模式 - 未实际修改文件');
    }

    // 显示报告
    const reportText = generateReport(report, 'console');
    console.log(reportText);

    // 保存报告到文件（如果指定了输出路径）
    if (config.outputFile) {
      await saveReportToFile(
        report,
        config.outputFile,
        config.processing.outputFormat,
      );
      console.log(`📄 报告已保存到: ${config.outputFile}`);
    }
  } catch (error) {
    console.error('\n💥 处理过程中发生错误:', error);
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    const program = createProgram();

    // 解析命令行参数
    program.parse();
    const options = parseOptions(program);

    // 加载配置
    const config = await loadConfig(options);

    // 验证配置
    const validation = validateConfig(config);
    if (!validation.valid) {
      console.error('❌ 配置验证失败:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      showHelp();
      process.exit(1);
    }

    // 解析文件扩展名
    const extensions = options.exts
      ? options.exts.split(',').map(ext => ext.trim())
      : config.processing.defaultExtensions;

    // 添加输出文件配置
    const fullConfig = {
      ...config,
      outputFile: options.output,
    };

    // 执行处理
    await processRepository(
      options.root,
      extensions,
      fullConfig,
      options.dryRun || false,
      options.verbose || false,
    );
  } catch (error) {
    console.error('💥 程序执行失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
