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

import { Command } from 'commander';
import { CliOptions } from '../types/config';

/**
 * Create a command line program
 */
export const createProgram = (): Command => {
  const program = new Command();

  program
    .name('ai-translate')
    .description('将代码仓库中的中文注释翻译为英文')
    .version('1.0.0');

  program
    .requiredOption('-r, --root <directory>', '需要处理的根目录')
    .option(
      '-e, --exts <extensions>',
      '文件扩展名，用逗号分隔 (例: ts,js,go)',
      '',
    )
    .option('--access-key-id <key>', '火山引擎 Access Key ID')
    .option('--secret-access-key <key>', '火山引擎 Secret Access Key')
    .option('--region <region>', '火山引擎服务区域', 'cn-beijing')
    .option('--source-language <lang>', '源语言代码', 'zh')
    .option('--target-language <lang>', '目标语言代码', 'en')
    .option('--dry-run', '仅分析不实际修改文件')
    .option('-v, --verbose', '详细输出模式')
    .option('-o, --output <file>', '报告输出文件路径')
    .option('-c, --config <file>', '配置文件路径')
    .option('--concurrency <number>', '并发翻译数量', '3')
    .option('--max-retries <number>', '最大重试次数', '3')
    .option('--timeout <number>', 'API超时时间(毫秒)', '30000');

  return program;
};

/**
 * Parse command line options
 */
export const parseOptions = (program: Command): CliOptions => {
  const options = program.opts();

  return {
    root: options.root,
    exts: options.exts,
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
    region: options.region,
    sourceLanguage: options.sourceLanguage,
    targetLanguage: options.targetLanguage,
    dryRun: options.dryRun,
    verbose: options.verbose,
    output: options.output,
    config: options.config,
  };
};

/**
 * Display help information
 */
export const showHelp = (): void => {
  console.log(`
🤖 AI翻译工具 - 中文注释转英文（基于火山引擎翻译）

使用方法:
  ai-translate --root <目录> [选项]

示例:
  # 基本使用
  ai-translate --root ./src --access-key-id <YOUR_KEY_ID> --secret-access-key <YOUR_SECRET>

  # 指定文件类型和翻译语言
  ai-translate --root ./src --exts ts,js,go --source-language zh --target-language en

  # 仅预览，不修改文件
  ai-translate --root ./src --dry-run

  # 指定区域和并发数
  ai-translate --root ./src --region ap-southeast-1 --concurrency 5

  # 生成详细报告
  ai-translate --root ./src --verbose --output report.json

环境变量:
  VOLC_ACCESS_KEY_ID        火山引擎 Access Key ID（必需）
  VOLC_SECRET_ACCESS_KEY    火山引擎 Secret Access Key（必需）

配置文件示例 (config.json):
{
  "translation": {
    "accessKeyId": "your-access-key-id",
    "secretAccessKey": "your-secret-access-key",
    "region": "cn-beijing",
    "sourceLanguage": "zh",
    "targetLanguage": "en",
    "maxRetries": 3,
    "concurrency": 3
  },
  "processing": {
    "defaultExtensions": ["ts", "js", "go", "md"]
  }
}
`);
};

/**
 * Show version information
 */
export const showVersion = (): void => {
  console.log('ai-translate version 1.0.0');
};
