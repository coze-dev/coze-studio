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

import * as t from '../src/proto';

describe('ferry-parser', () => {
  describe('proto service', () => {
    it('should convert service extensions', () => {
      const idl = `
      syntax = "proto3";
      service Foo {
        option (api.uri_prefix) = "//example.com";
      }
      `;

      const expected = { uri_prefix: '//example.com' };
      const document = t.parse(idl);
      const Foo = (document.root.nested || {}).Foo as t.ServiceDefinition;
      return expect(Foo.extensionConfig).to.eql(expected);
    });

    it('should convert service extensions with package', () => {
      const idl = `
      syntax = "proto3";
      package example;
      service Foo {
        option (api.uri_prefix) = "//example.com";
      }
      `;

      const expected = { uri_prefix: '//example.com' };
      const document = t.parse(idl);
      const Foo = ((document.root.nested || {}).example.nested || {})
        .Foo as t.ServiceDefinition;
      return expect(Foo.extensionConfig).to.eql(expected);
    });
  });
});
