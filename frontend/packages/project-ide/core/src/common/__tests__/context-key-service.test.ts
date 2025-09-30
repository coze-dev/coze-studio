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

import 'reflect-metadata';
import { ContextKeyService, ContextKey } from '../context-key-service';

describe('ContextKeyService', () => {
  let service: ContextKeyService;

  beforeEach(() => {
    service = new ContextKeyService();
  });

  describe('basic functionality', () => {
    it('should set and get context values', () => {
      service.setContext('testKey', true);
      expect(service.getContext<boolean>('testKey')).toBe(true);
    });

    it('should have default editorFocus context', () => {
      expect(service.getContext<boolean>(ContextKey.editorFocus)).toBe(true);
    });
  });

  describe('expression matching', () => {
    beforeEach(() => {
      service.setContext('active', true);
      service.setContext('visible', false);
    });

    it('should match simple boolean expressions', () => {
      expect(service.match('active')).toBe(true);
      expect(service.match('visible')).toBe(false);
    });

    it('should match complex boolean expressions', () => {
      expect(service.match('active && visible')).toBe(false);
      expect(service.match('active || visible')).toBe(true);
      expect(service.match('!visible')).toBe(true);
    });

    it('should handle unknown context keys safely', () => {
      expect(service.match('unknownKey')).toBe(false);
      expect(service.match('active && unknownKey')).toBe(false);
    });
  });

  describe('security', () => {
    it('should reject malicious expressions', () => {
      const maliciousExpressions = [
        'alert("xss")',
        'console.log("test")',
        'process.exit(0)',
        'require("fs")',
        'new Function("alert(1)")()',
        'eval("1+1")',
        'window.location = "evil.com"',
        'document.createElement("script")',
        '(() => { alert(1); })()',
        'active; alert(1)',
      ];

      maliciousExpressions.forEach(expr => {
        expect(service.match(expr)).toBe(false);
      });
    });

    it('should only allow safe boolean operations', () => {
      service.setContext('key1', true);
      service.setContext('key2', false);

      const safeExpressions = [
        'key1',
        'key1 && key2',
        'key1 || key2',
        '!key1',
        'key1 == key2',
        'key1 != key2',
        'key1 === key2',
        'key1 !== key2',
      ];

      safeExpressions.forEach(expr => {
        expect(() => service.match(expr)).not.toThrow();
      });
    });

    it('should handle edge cases gracefully', () => {
      expect(service.match('')).toBe(false);
      expect(service.match('   ')).toBe(false);
      expect(service.match('123')).toBe(false);
      expect(service.match('true')).toBe(true); // 'true' is a boolean literal
      expect(service.match('false')).toBe(false); // 'false' is a boolean literal
    });
  });
});
