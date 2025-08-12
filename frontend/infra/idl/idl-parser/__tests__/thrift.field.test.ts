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

import * as t from '../src/thrift';

describe('ferry-parser', () => {
  describe('thrift field', () => {
    it('should convert struct field extensions', () => {
      const idl = `
      enum Numbers {
        ONE = 1
      }
      struct Foo {
        1: string k1 (api.position = "query")
        2: string k2 (api.position = 'body', aapi.position = 'query')
        3: string k3 (api.position = 'path', api.positionn = 'query')
        4: string k4 (api.position = 'header')
        5: string k5 (api.position = 'entire_body')
        6: string k6 (api.position = 'raw_body')
        7: string k7 (api.position = 'status_code')
        10: string k10 (api.key = 'key10')
        11: string k11 (api.key = 'k11')
        12: binary k12 (api.web_type = 'File')
        13: string k13 (api.value_type = 'any')
        14: list<string> k14 (api.value_type = 'any')
        21: i32 k21 (api.query = 'k21[]')
        22: i32 k22 (api.body = 'k22')
        23: i32 k23 (api.path = 'k23')
        24: i32 k24 (api.header = 'k24')
        25: i32 k25 (api.entire_body = 'key25')
        26: i32 k26 (api.raw_body = 'key_26')
        27: i32 k27 (api.status_code = 'key-27')
        31: i32 k31 (api.query = 'key31', api.web_type = 'number', api.position = '')
        32: i32 k32 (api.position = 'body', api.key='key32', api.value_type = 'any')
        33: i64 k33 (api.body="kk33, omitempty")
        34: Numbers k34 (api.position = 'path')
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
        { value_type: 'any' },
        { value_type: 'any' },
        { position: 'query' },
        { position: 'body' },
        { position: 'path' },
        { position: 'header' },
        { position: 'entire_body', key: 'key25' },
        { position: 'raw_body', key: 'key_26' },
        { position: 'status_code', key: 'key-27' },
        { position: 'query', key: 'key31', web_type: 'number' },
        { position: 'body', key: 'key32', value_type: 'any' },
        { position: 'body', key: 'kk33', tag: 'omitempty' },
        { position: 'path' },
      ];

      const document = t.parse(idl);
      const { fields } = document.body[1] as t.InterfaceWithFields;
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert union field extensions', () => {
      const idl = `
      union Foo {
        1: string k1 (api.position = "query")
      }
      `;

      const expected = [{ position: 'query' }];

      const document = t.parse(idl, { reviseTailComment: false });
      const { fields } = document.body[0] as t.InterfaceWithFields;
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert struct field extensions using agw specification', () => {
      const idl = `
      struct Foo {
        1: string k1 (agw.source = 'query')
        2: string k2 (agw.source = 'body')
        3: string k3 (agw.source = 'path')
        4: string k4 (agw.source = 'header')
        5: string k5 (agw.source = 'raw_body')
        6: string k6 (agw.target = 'header')
        7: string k7 (agw.target = 'body')
        7: string k7 (agw.target = 'http_code')
        10: string k10 (agw.key = 'key10')
      }
      `;

      const expected = [
        { position: 'query' },
        { position: 'body' },
        { position: 'path' },
        { position: 'header' },
        { position: 'raw_body' },
        { position: 'header' },
        { position: 'body' },
        { position: 'status_code' },
        { key: 'key10' },
      ];

      const document = t.parse(idl);
      const { fields } = document.body[0] as t.InterfaceWithFields;
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert struct field extensions using golang tag', () => {
      const idl = `
      struct Foo {
        1: string k1 (go.tag = "json:\\"key1\\"")
        2: string k2 (go.tag = 'json:"key2,omitempty"')
        3: string k3 (go.tag = 'jsonn:"key2,omitempty"')
      }
      `;

      const expected = [{ key: 'key1' }, { key: 'key2', tag: 'omitempty' }, {}];
      const document = t.parse(idl);
      const { fields } = document.body[0] as t.InterfaceWithFields;
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should throw an error when using invalid type for a path parameter', () => {
      const idl = `
      struct Foo {
        1: bool k1 (api.position = 'path')
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

    it('should revise field comments', () => {
      const idl = `
      struct Foo {
        // c1
        1: string k1 // c2
        /* c3 */
        2: string k2 /* c4 */
        // c5
        /* c6 */
        3: string k3 // c7
        /* c8
        c9 */
        4: string k4
        // c10
        5: string k5; /* c11 */
      }
      `;

      const expected = [
        ['c1', 'c2'],
        [['c3'], ['c4']],
        ['c5', ['c6'], 'c7'],
        [['c8', ' c9']],
        ['c10', ['c11']],
      ];

      const document = t.parse(idl);
      const { fields } = document.body[0] as t.InterfaceWithFields;
      const comments = fields.map(field =>
        field.comments.map(comment => comment.value),
      );
      return expect(comments).to.eql(expected);
    });

    it('should revise empty field comments', () => {
      const idl = `
      /*
      */
      struct Foo {
        /**/
        1: string k1
        /* */
        2: string k2
        /** */
        3: string k3
      }
      `;

      const expected = [[['']], [['']], [['']]];

      const document = t.parse(idl);
      const { fields } = document.body[0] as t.InterfaceWithFields;
      const comments = fields.map(field =>
        field.comments.map(comment => comment.value),
      );
      return expect(comments).to.eql(expected);
    });
  });
});
