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

import * as path from 'path';

import * as t from '../src/thrift';

describe('ferry-parser', () => {
  describe('thrift index', () => {
    it('should convert the file content', () => {
      const idl = path.resolve(__dirname, 'idl/index.thrift');
      const expected = { uri_prefix: 'https://example.com' };

      const document = t.parse(idl);
      const { extensionConfig } = document.body[0] as t.ServiceDefinition;
      return expect(extensionConfig).to.eql(expected);
    });

    it('should throw an error due to invalid file path', () => {
      const idl = path.resolve(__dirname, 'idl/indexx.thrift');

      try {
        t.parse(idl);
      } catch (err) {
        const { message } = err;
        return expect(message).to.includes('no such file:');
      }

      return expect(true).to.equal(false);
    });

    it('should throw an syntax error', () => {
      const idl = `
      struct Foo {
        1: string k1,,
      }
  `;

      const expected = 'FieldType expected but found: CommaToken(source:3:';

      try {
        t.parse(idl);
      } catch (err) {
        const { message } = err;
        return expect(message).to.include(expected);
      }

      return expect(true).to.equal(false);
    });

    it('should throw an syntax error in the file content', () => {
      const idl = path.resolve(__dirname, 'idl/error.thrift');

      const expected = '__tests__/idl/error.thrift:2:16)';

      try {
        t.parse(idl);
      } catch (err) {
        const { message } = err;
        return expect(message).includes(expected);
      }

      return expect(true).equal(false);
    });
  });
});
