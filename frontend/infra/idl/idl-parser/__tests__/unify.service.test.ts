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

import * as t from '../src';
import { filterKeys } from './common';

describe('unify-parser', () => {
  describe('thrift service', () => {
    it('should convert service extensions', () => {
      const fileContent = `
      service Foo {
      } (api.uri_prefix = 'https://example.com')
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': fileContent },
      );
      const { extensionConfig, name } = document
        .statements[0] as t.ServiceDefinition;
      expect(extensionConfig).to.eql({ uri_prefix: 'https://example.com' });
      expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Foo',
        namespaceValue: 'root.Foo',
      });
    });
  });

  describe('proto service', () => {
    it('should convert service extensions', () => {
      const fileContent = `
      syntax = "proto3";
      service Foo {
        option (api.uri_prefix) = "//example.com";
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        { 'index.proto': fileContent },
      );
      const { extensionConfig, name } = document
        .statements[0] as t.ServiceDefinition;
      expect(extensionConfig).to.eql({ uri_prefix: '//example.com' });
      expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Foo',
        namespaceValue: 'root.Foo',
      });
    });
  });
});
