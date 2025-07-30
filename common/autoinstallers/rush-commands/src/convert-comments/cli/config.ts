import { AppConfig, CliOptions, TranslationConfig, ProcessingConfig } from '../types/config';
import { deepMerge } from '../utils/fp';

/**
 * 默认配置
 */
const DEFAULT_CONFIG: AppConfig = {
  translation: {
    accessKeyId: process.env.VOLC_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.VOLC_SECRET_ACCESS_KEY || '',
    region: 'cn-beijing',
    sourceLanguage: 'zh',
    targetLanguage: 'en',
    maxRetries: 3,
    timeout: 30000,
    concurrency: 3
  },
  processing: {
    defaultExtensions: [
      'ts', 'tsx', 'js', 'jsx', 'go', 'md', 'txt', 'json',
      'yaml', 'yml', 'toml', 'ini', 'conf', 'config',
      'sh', 'bash', 'zsh', 'fish', 'py', 'css', 'scss', 'sass', 'less',
      'html', 'htm', 'xml', 'php', 'rb', 'rs', 'java', 'c', 'h',
      'cpp', 'cxx', 'cc', 'hpp', 'cs', 'thrift'
    ],
    outputFormat: 'console'
  },
  git: {
    ignorePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
    includeUntracked: false
  }
};

/**
 * 从文件加载配置
 */
export const loadConfigFromFile = async (configPath: string): Promise<Partial<AppConfig>> => {
  try {
    const fs = await import('fs/promises');
    const configContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.warn(`配置文件加载失败: ${configPath}`, error);
    return {};
  }
};

/**
 * 从命令行选项创建配置
 */
export const createConfigFromOptions = (options: CliOptions): Partial<AppConfig> => {
  const config: Partial<AppConfig> = {};

  // 翻译配置
  if (options.accessKeyId || options.secretAccessKey || options.region || options.sourceLanguage || options.targetLanguage) {
    config.translation = {} as Partial<TranslationConfig>;
    if (options.accessKeyId) {
      config.translation!.accessKeyId = options.accessKeyId;
    }
    if (options.secretAccessKey) {
      config.translation!.secretAccessKey = options.secretAccessKey;
    }
    if (options.region) {
      config.translation!.region = options.region;
    }
    if (options.sourceLanguage) {
      config.translation!.sourceLanguage = options.sourceLanguage;
    }
    if (options.targetLanguage) {
      config.translation!.targetLanguage = options.targetLanguage;
    }
  }

  // 处理配置
  if (options.output) {
    config.processing = {} as Partial<ProcessingConfig>;
    // 根据输出文件扩展名推断格式
    const ext = options.output.toLowerCase().split('.').pop();
    if (ext === 'json') {
      config.processing!.outputFormat = 'json';
    } else if (ext === 'md') {
      config.processing!.outputFormat = 'markdown';
    }
  }

  return config;
};

/**
 * 合并配置
 */
export const mergeConfigs = (...configs: Partial<AppConfig>[]): AppConfig => {
  return configs.reduce(
    (merged, config) => deepMerge(merged, config),
    { ...DEFAULT_CONFIG }
  ) as AppConfig;
};

/**
 * 加载完整配置
 */
export const loadConfig = async (options: CliOptions): Promise<AppConfig> => {
  const configs: Partial<AppConfig>[] = [DEFAULT_CONFIG];

  // 加载配置文件
  if (options.config) {
    const fileConfig = await loadConfigFromFile(options.config);
    configs.push(fileConfig);
  }

  // 加载命令行选项配置
  const optionsConfig = createConfigFromOptions(options);
  configs.push(optionsConfig);

  return mergeConfigs(...configs);
};

/**
 * 验证配置
 */
export const validateConfig = (config: AppConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 验证火山引擎 Access Key ID
  if (!config.translation.accessKeyId) {
    errors.push('火山引擎 Access Key ID 未设置，请通过环境变量VOLC_ACCESS_KEY_ID或--access-key-id参数提供');
  }

  // 验证火山引擎 Secret Access Key
  if (!config.translation.secretAccessKey) {
    errors.push('火山引擎 Secret Access Key 未设置，请通过环境变量VOLC_SECRET_ACCESS_KEY或--secret-access-key参数提供');
  }

  // 验证区域
  const validRegions = ['cn-beijing', 'ap-southeast-1', 'us-east-1'];
  if (!validRegions.includes(config.translation.region)) {
    console.warn(`未知的区域: ${config.translation.region}，建议使用: ${validRegions.join(', ')}`);
  }

  // 验证语言代码
  const validLanguages = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru'];
  if (!validLanguages.includes(config.translation.sourceLanguage)) {
    console.warn(`未知的源语言: ${config.translation.sourceLanguage}，建议使用: ${validLanguages.join(', ')}`);
  }
  if (!validLanguages.includes(config.translation.targetLanguage)) {
    console.warn(`未知的目标语言: ${config.translation.targetLanguage}，建议使用: ${validLanguages.join(', ')}`);
  }

  // 验证并发数
  if (config.translation.concurrency < 1 || config.translation.concurrency > 10) {
    errors.push('并发数应该在1-10之间');
  }

  // 验证超时时间
  if (config.translation.timeout < 1000 || config.translation.timeout > 300000) {
    errors.push('超时时间应该在1000-300000毫秒之间');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * 打印配置信息
 */
export const printConfigInfo = (config: AppConfig, verbose: boolean = false): void => {
  console.log('🔧 当前配置:');
  console.log(`  区域: ${config.translation.region}`);
  console.log(`  源语言: ${config.translation.sourceLanguage}`);
  console.log(`  目标语言: ${config.translation.targetLanguage}`);
  console.log(`  并发数: ${config.translation.concurrency}`);
  console.log(`  重试次数: ${config.translation.maxRetries}`);
  console.log(`  输出格式: ${config.processing.outputFormat}`);

  if (verbose) {
    console.log(`  Access Key ID: ${config.translation.accessKeyId ? '已设置' : '未设置'}`);
    console.log(`  Secret Access Key: ${config.translation.secretAccessKey ? '已设置' : '未设置'}`);
    console.log(`  超时时间: ${config.translation.timeout}ms`);
    console.log(`  默认扩展名: ${config.processing.defaultExtensions.join(', ')}`);
    console.log(`  忽略模式: ${config.git.ignorePatterns.join(', ')}`);
    console.log(`  包含未跟踪文件: ${config.git.includeUntracked ? '是' : '否'}`);
  }
};
