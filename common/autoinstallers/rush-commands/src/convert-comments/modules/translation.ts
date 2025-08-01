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

import {
  TranslationResult,
  TranslationContext,
  ChineseComment,
  TranslationError,
} from '../types/index';
import { TranslationConfig } from '../types/config';
import { retry, chunk } from '../utils/fp';
import { isValidTranslation } from '../utils/chinese';
import {
  translate as volcTranslate,
  TranslateConfig as VolcTranslateConfig,
} from '../volc/translate';

/**
 * Translation services
 */
export class TranslationService {
  private config: TranslationConfig;
  private cache = new Map<string, TranslationResult>();

  constructor(config: TranslationConfig) {
    this.config = config;
  }

  /**
   * Convert to Volcano Engine Translation Configuration
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
   * Calculate translation confidence level (simple implementation)
   */
  private calculateConfidence(translated: string, original: string): number {
    // Simple confidence level calculation based on length ratio and validity
    const lengthRatio = translated.length / original.length;

    if (!isValidTranslation(original, translated)) {
      return 0;
    }

    // The ideal length ratio is between 0.8-2
    let confidence = 0.8;
    if (lengthRatio >= 0.8 && lengthRatio <= 2.0) {
      confidence = 0.9;
    }

    return confidence;
  }

  /**
   * Call Volcano Engine API for translation
   */
  private async callVolcTranslate(texts: string[]): Promise<string[]> {
    const volcConfig = this.toVolcConfig();
    const response = await volcTranslate(texts, volcConfig);

    return response.TranslationList.map(item => item.Translation);
  }

  /**
   * Translate a single comment
   */
  async translateComment(
    comment: string,
    context?: TranslationContext,
  ): Promise<TranslationResult> {
    // Check cache
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

      // cache results
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      throw new TranslationError(
        `Translation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        comment,
      );
    }
  }

  /**
   * generate cache key
   */
  private getCacheKey(comment: string, context?: TranslationContext): string {
    const contextStr = context
      ? `${context.language}-${context.commentType}-${context.nearbyCode || ''}`
      : '';
    return `${comment}|${contextStr}`;
  }

  /**
   * batch translation annotations
   */
  async batchTranslate(
    comments: ChineseComment[],
    concurrency: number = this.config.concurrency,
  ): Promise<TranslationResult[]> {
    // Extract uncached comments
    const uncachedComments: { comment: ChineseComment; index: number }[] = [];
    const results: TranslationResult[] = new Array(comments.length);

    // Check cache
    comments.forEach((comment, index) => {
      const cacheKey = this.getCacheKey(comment.content);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        results[index] = cached;
      } else {
        uncachedComments.push({ comment, index });
      }
    });

    // If all comments are cached, return directly
    if (uncachedComments.length === 0) {
      return results;
    }

    // Batch translation of uncached comments
    const chunks = chunk(uncachedComments, concurrency);

    for (const chunkItems of chunks) {
      try {
        const textsToTranslate = chunkItems.map(item => item.comment.content);
        const translations = await retry(
          () => this.callVolcTranslate(textsToTranslate),
          this.config.maxRetries,
          1000,
        );

        // Processing translation results
        chunkItems.forEach((item, chunkIndex) => {
          const translated = translations[chunkIndex];
          if (translated) {
            const result: TranslationResult = {
              original: item.comment.content,
              translated,
              confidence: this.calculateConfidence(
                translated,
                item.comment.content,
              ),
            };

            // cache results
            const cacheKey = this.getCacheKey(item.comment.content);
            this.cache.set(cacheKey, result);

            results[item.index] = result;
          } else {
            // If the translation fails, an error result is created
            results[item.index] = {
              original: item.comment.content,
              translated: item.comment.content, // Keep the original text when translation fails
              confidence: 0,
            };
          }
        });
      } catch (error) {
        // If the entire batch translation fails, an error result is created for all comments in that batch
        chunkItems.forEach(item => {
          results[item.index] = {
            original: item.comment.content,
            translated: item.comment.content, // Keep the original text when translation fails
            confidence: 0,
          };
        });

        console.warn(
          `批量翻译失败: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return results;
  }

  /**
   * Save translation cache to file
   */
  async saveCache(filePath: string): Promise<void> {
    const cacheData = Object.fromEntries(this.cache);
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2));
  }

  /**
   * Load translation cache from file
   */
  async loadCache(filePath: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(filePath, 'utf-8');
      const cacheData = JSON.parse(data);
      this.cache = new Map(Object.entries(cacheData));
    } catch {
      // The cache file does not exist or is corrupted, ignore it
    }
  }

  /**
   * clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Actual statistical hit rate is required
    };
  }
}
