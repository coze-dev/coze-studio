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

import { injectable } from 'inversify';

export enum ContextKey {
  /**
   *
   */
  editorFocus = 'editorFocus',
}

export const ContextMatcher = Symbol('ContextMatcher');

export interface ContextMatcher {
  /**
   * Determines whether the expression hits the context
   */
  match: (expression: string) => boolean;
}

/**
 * Global context key context management
 */
@injectable()
export class ContextKeyService implements ContextMatcher {
  private _contextKeys: Map<string, unknown> = new Map();

  public constructor() {
    this._contextKeys.set(ContextKey.editorFocus, true);
  }

  public setContext(key: string, value: unknown): void {
    this._contextKeys.set(key, value);
  }

  public getContext<T>(key: string): T {
    return this._contextKeys.get(key) as T;
  }

  public match(expression: string): boolean {
    try {
      return this.evaluateExpression(expression);
    } catch (error) {
      console.warn('Invalid context expression:', expression, error);
      return false;
    }
  }

  private evaluateExpression(expression: string): boolean {
    const sanitizedExpression = expression.trim();

    // Allow only safe boolean expressions with context keys
    const safeExpressionPattern =
      /^!?[a-zA-Z_$][a-zA-Z0-9_$]*(\s*(&&|\|\||==|!=|===|!==)\s*!?[a-zA-Z_$][a-zA-Z0-9_$]*)*$/;

    if (!safeExpressionPattern.test(sanitizedExpression)) {
      throw new Error('Unsafe expression detected');
    }

    // Parse and evaluate the expression safely
    return this.safeEvaluate(sanitizedExpression);
  }

  private safeEvaluate(expression: string): boolean {
    // Replace context keys with their actual values
    let executableExpression = expression;

    // Track which keys have been replaced to avoid replacing them again
    const replacedKeys = new Set<string>();

    for (const [key, value] of this._contextKeys) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      // Convert all values to boolean string representation
      const boolValue = Boolean(value);
      if (executableExpression.includes(key)) {
        executableExpression = executableExpression.replace(
          regex,
          String(boolValue),
        );
        replacedKeys.add(key);
      }
    }

    // Now evaluate the boolean expression safely
    // Only allow basic boolean operations
    try {
      // Remove any remaining unrecognized identifiers (replace with false)
      // But don't replace 'true' or 'false' literals
      executableExpression = executableExpression.replace(
        /\b(?!true|false)[a-zA-Z_$][a-zA-Z0-9_$]*\b/g,
        'false',
      );

      // eslint-disable-next-line no-eval -- Safe after sanitization
      return Boolean(eval(executableExpression));
    } catch (error) {
      console.warn('Expression evaluation failed:', error);
      return false;
    }
  }
}
