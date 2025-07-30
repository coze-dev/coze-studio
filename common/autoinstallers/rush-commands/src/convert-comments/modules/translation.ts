import {
  TranslationResult,
  TranslationContext,
  ChineseComment,
  TranslationError,
} from '../types/index';
import { TranslationConfig } from '../types/config';
import { retry, chunk } from '../utils/fp';
import { isValidTranslation } from '../utils/chinese';
import { translate as volcTranslate, TranslateConfig as VolcTranslateConfig } from '../volc/translate';

/**
 * 翻译服务类
 */
export class TranslationService {
  private config: TranslationConfig;
  private cache = new Map<string, TranslationResult>();

  constructor(config: TranslationConfig) {
    this.config = config;
  }

  /**
   * 转换为火山引擎翻译配置
   */
  private toVolcConfig(): VolcTranslateConfig {
    return {
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      region: this.config.region,
      sourceLanguage: this.config.sourceLanguage,
      targetLanguage: this.config.targetLanguage,
    };
  }

  /**
   * 计算翻译置信度（简单实现）
   */
  private calculateConfidence(translated: string, original: string): number {
    // 基于长度比例和有效性的简单置信度计算
    const lengthRatio = translated.length / original.length;

    if (!isValidTranslation(original, translated)) {
      return 0;
    }

    // 理想的长度比例在0.8-2.0之间
    let confidence = 0.8;
    if (lengthRatio >= 0.8 && lengthRatio <= 2.0) {
      confidence = 0.9;
    }

    return confidence;
  }

  /**
   * 调用火山引擎API进行翻译
   */
  private async callVolcTranslate(texts: string[]): Promise<string[]> {
    const volcConfig = this.toVolcConfig();
    const response = await volcTranslate(texts, volcConfig);
    
    return response.TranslationList.map(item => item.Translation);
  }

  /**
   * 翻译单个注释
   */
  async translateComment(
    comment: string,
    context?: TranslationContext,
  ): Promise<TranslationResult> {
    // 检查缓存
    const cacheKey = this.getCacheKey(comment, context);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const translations = await retry(
        () => this.callVolcTranslate([comment]),
        this.config.maxRetries,
        1000,
      );

      const translated = translations[0];
      if (!translated) {
        throw new Error('Empty translation response');
      }

      const result: TranslationResult = {
        original: comment,
        translated,
        confidence: this.calculateConfidence(translated, comment),
      };

      // 缓存结果
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      throw new TranslationError(
        `Translation failed: ${error instanceof Error ? error.message : String(error)}`,
        comment,
      );
    }
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(comment: string, context?: TranslationContext): string {
    const contextStr = context
      ? `${context.language}-${context.commentType}-${context.nearbyCode || ''}`
      : '';
    return `${comment}|${contextStr}`;
  }

  /**
   * 批量翻译注释
   */
  async batchTranslate(
    comments: ChineseComment[],
    concurrency: number = this.config.concurrency,
  ): Promise<TranslationResult[]> {
    // 提取未缓存的注释
    const uncachedComments: { comment: ChineseComment; index: number }[] = [];
    const results: TranslationResult[] = new Array(comments.length);

    // 检查缓存
    comments.forEach((comment, index) => {
      const cacheKey = this.getCacheKey(comment.content);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        results[index] = cached;
      } else {
        uncachedComments.push({ comment, index });
      }
    });

    // 如果所有注释都已缓存，直接返回
    if (uncachedComments.length === 0) {
      return results;
    }

    // 分批翻译未缓存的注释
    const chunks = chunk(uncachedComments, concurrency);
    
    for (const chunkItems of chunks) {
      try {
        const textsToTranslate = chunkItems.map(item => item.comment.content);
        const translations = await retry(
          () => this.callVolcTranslate(textsToTranslate),
          this.config.maxRetries,
          1000,
        );

        // 处理翻译结果
        chunkItems.forEach((item, chunkIndex) => {
          const translated = translations[chunkIndex];
          if (translated) {
            const result: TranslationResult = {
              original: item.comment.content,
              translated,
              confidence: this.calculateConfidence(translated, item.comment.content),
            };

            // 缓存结果
            const cacheKey = this.getCacheKey(item.comment.content);
            this.cache.set(cacheKey, result);
            
            results[item.index] = result;
          } else {
            // 如果翻译失败，创建一个错误结果
            results[item.index] = {
              original: item.comment.content,
              translated: item.comment.content, // 翻译失败时保持原文
              confidence: 0,
            };
          }
        });
      } catch (error) {
        // 如果整个批次翻译失败，为这个批次的所有注释创建错误结果
        chunkItems.forEach(item => {
          results[item.index] = {
            original: item.comment.content,
            translated: item.comment.content, // 翻译失败时保持原文
            confidence: 0,
          };
        });
        
        console.warn(`批量翻译失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return results;
  }

  /**
   * 保存翻译缓存到文件
   */
  async saveCache(filePath: string): Promise<void> {
    const cacheData = Object.fromEntries(this.cache);
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
  }

  /**
   * 从文件加载翻译缓存
   */
  async loadCache(filePath: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(filePath, 'utf-8');
      const cacheData = JSON.parse(data);
      this.cache = new Map(Object.entries(cacheData));
    } catch {
      // 缓存文件不存在或损坏，忽略
    }
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // 需要实际统计命中率
    };
  }
}
