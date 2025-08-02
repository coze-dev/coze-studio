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
  describe('proto field', () => {
    it('should convert message field extensions', () => {
      const idl = `
      syntax = "proto3";
      enum Numbers {
        ONE = 1;
      }
      message Foo {
        string k1 = 1 [(api.position) = "query"];
        string k2 = 2 [(api.position) = 'body'];
        string k3 = 3 [(api.position) = 'path'];
        string k4 = 4 [(api.position) = 'header'];
        string k5 = 5 [(api.position) = 'entire_body'];
        string k6 = 6 [(api.position) = 'raw_body', (aapi.position) = 'raw_body'];
        string k7 = 7 [(api.position) = 'status_code', (api.positionn) = 'raw_body'];
        string k10 = 10 [(api.key) = 'key10'];
        string k11 = 11 [(api.key) = 'k11'];
        bytes k12 = 12 [(api.web_type) = 'File'];
        int32 k21 = 21 [(api.query) = 'k21'];
        int32 k22 = 22 [(api.body) = 'k22'];
        int32 k23 = 23 [(api.path) = 'k23'];
        int32 k24 = 24 [(api.header) = 'k24'];
        int32 k25 = 25 [(api.entire_body) = 'key25'];
        int32 k26 = 26 [(api.raw_body) = 'key_26'];
        int32 k27 = 27 [(api.status_code) = 'key-27'];
        int32 k31 = 31 [(api.query) = 'key31', (api.web_type) = 'number', (api.position) = ''];
        int32 k32 = 32 [(api.position) = 'body', (api.key)='key32', (api.value_type) = 'any'];
        int32 k33 = 33 [(api.method) = 'POST', (api.position) = 'QUERY'];
        int32 k34 = 34 ;
        Numbers k35 = 35 [(api.position) = 'path'];
      }
      `;

      const expected = [
        { position: 'query' },
        { position: 'body' },
        { position: 'path' },
        { position: 'header' },
        { position: 'entire_body' },
        { position: 'raw_body' },
        { position: 'status_code' },
        { key: 'key10' },
        {},
        { web_type: 'File' },
        { position: 'query' },
        { position: 'body' },
        { position: 'path' },
        { position: 'header' },
        { position: 'entire_body', key: 'key25' },
        { position: 'raw_body', key: 'key_26' },
        { position: 'status_code', key: 'key-27' },
        { position: 'query', key: 'key31', web_type: 'number' },
        { position: 'body', key: 'key32', value_type: 'any' },
        {},
        undefined,
        { position: 'path' },
      ];

      const document = t.parse(idl);
      const Foo = (document.root.nested || {}).Foo as t.MessageDefinition;
      const extensionConfigs = Object.values(Foo.fields).map(
        field => field.extensionConfig,
      );
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert message field extensions using old rules', () => {
      const idl = `
      syntax = "proto3";
      message Foo {
        int32 k1 = 1 [(api_req).query = 'k1'];
        int32 k2 = 2 [(api_req).body = 'k2'];
        int32 k3 = 3 [(api_req).path = 'k3'];
        int32 k4 = 4 [(api_req).header = 'k4'];
        int32 k6 = 5 [(api_req).raw_body = 'key5'];
        int32 k5 = 6 [(api_resp).header = 'key6'];
        int32 k7 = 7 [(api_resp).http_code = 'key7'];
        string k8 = 8 [(api_resp).body = 'k8'];
      }
      `;

      const expected = [
        { position: 'query' },
        { position: 'body' },
        { position: 'path' },
        { position: 'header' },
        { position: 'raw_body', key: 'key5' },
        { position: 'header', key: 'key6' },
        {},
        { position: 'body' },
      ];

      const document = t.parse(idl);
      const Foo = (document.root.nested || {}).Foo as t.MessageDefinition;
      const extensionConfigs = Object.values(Foo.fields).map(
        field => field.extensionConfig,
      );
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should throw an error when using invalid type for a path parameter', () => {
      const idl = `
      syntax = "proto3";
      message Foo {
        bool k1 = 1 [(api.position) = "path"];
      }
      `;

      try {
        t.parse(idl);
      } catch (err) {
        const { message } = err;
        const expected =
          "the type of path parameter 'k1' in 'Foo' should be string or integer";
        return expect(message).to.equal(expected);
      }

      return expect(true).to.equal(false);
    });
  });
});
