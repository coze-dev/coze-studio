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
  describe('thrift field', () => {
    it('should convert struct field extensions', () => {
      const content = `
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
        21: i32 k21 (api.query = 'k21')
        22: i32 k22 (api.body = 'k22')
        23: i32 k23 (api.path = 'k23')
        24: i32 k24 (api.header = 'k24')
        25: i32 k25 (api.entire_body = 'key25')
        26: i32 k26 (api.raw_body = 'key_26')
        27: i32 k27 (api.status_code = 'key-27')
        31: i32 k31 (api.query = 'key31', api.web_type = 'number', api.position = '')
        32: i32 k32 (api.position = 'body', api.key='key32', api.value_type = 'any')
        33: i64 k33 (api.body="kk33, omitempty")
        34: string list (api.query = 'list')
        35: Numbers k34 (api.position = 'path')
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
        { position: 'query' },
        { position: 'path' },
      ];

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { fields } = document.statements[1] as t.InterfaceWithFields;
      expect(fields[21].requiredness === 'optional');
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert union field extensions', () => {
      const content = `
      union Foo {
        1: string k1 (api.position = "query")
      }
      `;

      const expected = [{ position: 'query' }];

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert struct field extensions using agw specification', () => {
      const content = `
      struct Foo {
        1: string k1 (agw.source = 'query')
        2: string k2 (agw.source = 'body')
        3: string k3 (agw.source = 'path')
        4: string k4 (agw.source = 'header')
        5: string k5 (agw.source = 'raw_body')
        6: string k6 (agw.target = 'header')
        7: string k7 (agw.target = 'body')
        7: string k7 (agw.target = 'http_code')
        10: i64 k10 (agw.key = 'key10', agw.js_conv='str')
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
        { key: 'key10', tag: 'int2str' },
      ];

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert struct field extensions using golang tag', () => {
      const content = `
      struct Foo {
        1: string k1 (go.tag = "json:\\"key1\\"")
        2: string k2 (go.tag = 'json:"key2,omitempty"')
        3: string k3 (go.tag = 'jsonn:"key3,omitempty"')
        4: string k4 (go.tag = 'json:"-"')
        5: i32 k5 (go.tag = "json:\\"k5,string\\"")
        6: i32 k6 (go.tag = "json:\\"k6,string,omitempty\\"")
        7: string datasourceParam (go.tag="json:\\"datasource_param,omitempty\\"")
      }
      `;

      const expected = [
        { key: 'key1' },
        { key: 'key2', tag: 'omitempty' },
        {},
        { value_type: 'string' },
        { value_type: 'string', tag: 'omitempty' },
        { key: 'datasource_param', tag: 'omitempty' },
      ];
      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(fields[1].requiredness === 'optional');
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should throw an error when using invalid type for a path parameter', () => {
      const content = `
      struct Foo {
        1: bool k1 (api.position = 'path')
      }
      `;

      try {
        t.parse('index.thrift', { cache: false }, { 'index.thrift': content });
      } catch (err) {
        const { message } = err;
        const expected = "path parameter 'k1' should be string or integer";
        return expect(message).to.equal(expected);
      }

      return expect(true).to.equal(false);
    });

    it('should revise field comments', () => {
      const content = `
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
        5: string k5
      }
      `;

      const expected = [
        ['c1', 'c2'],
        [['c3'], ['c4']],
        ['c5', ['c6'], 'c7'],
        [['c8', ' c9']],
        [],
      ];

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      const comments = fields.map(field =>
        field.comments.map(comment => comment.value),
      );
      return expect(comments).to.eql(expected);
    });

    it('should revise field comments with dot', () => {
      const content = `
      struct Foo {
        // c1
        1: string k1, // c2
        /* c3 */
        2: string k2, /* c4 */
        // c5
        /* c6 */
        3: string k3; // c7
        /* c8
        c9 */
        4: string k4;
        5: string k5,
      }
      `;

      const expected = [
        ['c1', 'c2'],
        [['c3'], ['c4']],
        ['c5', ['c6'], 'c7'],
        [['c8', ' c9']],
        [],
      ];

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      const comments = fields.map(field =>
        field.comments.map(comment => comment.value),
      );
      return expect(comments).to.eql(expected);
    });

    it('should resolve struct name', () => {
      const content = `
      struct Foo {
      }
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { name } = document.statements[0] as t.InterfaceWithFields;
      return expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Foo',
        namespaceValue: 'root.Foo',
      });
    });

    it('should not resolve struct name', () => {
      const content = `
      struct Foo {
      }
      `;

      const document = t.parse(
        'index.thrift',
        { namespaceRefer: false, cache: false },
        { 'index.thrift': content },
      );
      const { name } = document.statements[0] as t.InterfaceWithFields;
      return expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Foo',
        namespaceValue: undefined,
      });
    });

    it('should resolve struct name with a namespace', () => {
      const content = `
      namespace go a.b
      struct Foo {
      }
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { name } = document.statements[0] as t.InterfaceWithFields;
      return expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Foo',
        namespaceValue: 'a_b.Foo',
      });
    });

    it('should resolve field type', () => {
      const baseContent = `
      struct Common {}
      `;
      const indexContent = `
      include "./dep/base.thrift"
      struct Foo {
        1: base.Common k1
      }
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        {
          'index.thrift': indexContent,
          'dep/base.thrift': baseContent,
        },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      return expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Common',
        namespaceValue: 'root.Common',
      });
    });

    it('should not resolve field type', () => {
      const baseContent = `
      struct Common {}
      `;
      const indexContent = `
      include "./dep/base.thrift"
      struct Foo {
        1: base.Common k1
      }
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false, namespaceRefer: false },
        {
          'index.thrift': indexContent,
          'dep/base.thrift': baseContent,
        },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      return expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Common',
        namespaceValue: undefined,
      });
    });

    it('should resolve field type', () => {
      const baseAContent = `
      namespace go a
      struct Common {}
      struct Commonn {}
      `;

      const baseAbContent = `
      namespace go a
      struct Common {}
      struct Commonn {}
      `;
      const indexContent = `
      include "./dep/base_a.thrift"
      include "./dep/base_ab.thrift"
      struct Foo {
        1: base_a.Common k1
        2: map<string, base_ab.Commonn> k2
      }
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        {
          'index.thrift': indexContent,
          'dep/base_a.thrift': baseAContent,
          'dep/base_ab.thrift': baseAbContent,
        },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base_a.Common',
        namespaceValue: 'a.Common',
      });

      expect(
        filterKeys((fields[1].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'base_ab.Commonn',
        namespaceValue: 'a.Commonn',
      });
    });
  });

  describe('proto field', () => {
    it('should convert message field extensions', () => {
      const content = `
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
        required string k10 = 10 [(api.key) = 'key10'];
        optional string k11 = 11 [(api.key) = 'k11'];
        bytes k12 = 12 [(api.web_type) = 'File'];
        int32 k21 = 21 [(api.query) = 'k21[]'];
        int32 k22 = 22 [(api.body) = 'k22'];
        int32 k23 = 23 [(api.path) = 'k23'];
        int32 k24 = 24 [(api.header) = 'k24'];
        int32 k25 = 25 [(api.entire_body) = 'key25'];
        int32 k26 = 26 [(api.raw_body) = 'key_26'];
        int32 k27 = 27 [(api.status_code) = 'key-27'];
        int32 k31 = 31 [(api.query) = 'key31', (api.web_type) = 'number', (api.position) = ''];
        int32 k32 = 32 [(api.position) = 'body', (api.key)='key32', (api.value_type) = 'any'];
        int32 k33 = 33 [(api.method) = 'POST', (api.position) = 'QUERY'];
        map<int32,string> k34 = 34 ;
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
        {},
        { position: 'path' },
      ];

      const document = t.parse(
        'index.proto',
        { cache: false },
        { 'index.proto': content },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert message field extensions using old rules', () => {
      const content = `
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

      const document = t.parse(
        'index.proto',
        { cache: false },
        { 'index.proto': content },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      const extensionConfigs = fields.map(field => field.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert message field extensions with error', () => {
      const content = `
      syntax = "proto3";
      message Foo {
        bytes k1 = 1 [(api.position) = 'path'];
      }
      `;

      try {
        t.parse('error.proto', { cache: false }, { 'error.proto': content });
      } catch (err) {
        return expect(err.message).to.equal(
          "path parameter 'k1' should be string or integer",
        );
      }

      return expect(1).to.eql(2);
    });

    it('should generate comments', () => {
      const content = `
      syntax = "proto3";

      message Foo {
        string k1 = 1; // c1
        string k2 = 2; //c2
        string k3 = 3; // c3
        string k4 = 4; /*c4*/
        string k5 = 5; /* c5 */
        string k6 = 6;
        // c7
        string k7 = 7;
        /* c8 */
        required string k8 = 8;
        /*c9*/
        optional string k9 = 9;
        /** c10 */
        bytes k10 = 10;
        /**
        * c11
        */
        int32 k11 = 11 [(api.query) = 'k21'];
      }
      `;

      const expected = [
        ['c1'],
        ['c2'],
        ['c3'],
        ['4'],
        ['c5'],
        undefined,
        ['c7'],
        ['c8'],
        ['9'],
        ['c10'],
        ['c11'],
      ];

      const document = t.parse(
        'index.proto',
        { cache: false },
        { 'index.proto': content },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;
      const fieldComments = fields.map(
        field => field.comments[0] && field.comments[0].value,
      );
      return expect(fieldComments).to.eql(expected);
    });

    it('should resolve message name', () => {
      const content = `
      syntax = "proto3";
      message Foo {
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        { 'index.proto': content },
      );
      const { name } = document.statements[0] as t.InterfaceWithFields;
      return expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Foo',
        namespaceValue: 'root.Foo',
      });
    });

    it('should resolve field type without packages', () => {
      const baseContent = `
      syntax = "proto3";
      message Common {
      }
      `;

      const indexContent = `
      syntax = "proto3";
      import "base.proto";
      message Foo {
        Common k1 = 1;
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
          'base.proto': baseContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      return expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Common',
        namespaceValue: 'root.Common',
      });
    });

    it('should resolve field type with a same package', () => {
      const baseContent = `
      syntax = "proto3";
      package a.b;
      message Common {
      }

      message Commonn {
      }
      `;

      const indexContent = `
      syntax = "proto3";
      package a.b;
      import "base.proto";
      message Foo {
        Common k1 = 1;
        a.b.Common k2 = 2;
        Commonn k3 = 3;
      }

      message Commonn {
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
          'base.proto': baseContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Common',
        namespaceValue: 'a_b.Common',
      });

      expect(
        filterKeys(fields[1].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Common',
        namespaceValue: 'a_b.Common',
      });

      expect(
        filterKeys(fields[2].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Commonn',
        namespaceValue: 'a_b.Commonn',
      });
    });

    it('should resolve field type with nested packages', () => {
      const baseAContent = `
      syntax = "proto3";
      package a;
      message Common {
      }

      message Commonn {
      }
      `;

      const baseAaContent = `
      syntax = "proto3";
      package a;
      message Common {
      }
      `;

      const baseAbContent = `
      syntax = "proto3";
      package a.b;
      message Common {
      }
      `;

      const indexContent = `
      syntax = "proto3";
      package a.b.c;
      import "base_a.proto";
      import "base_aa.proto";
      import "base_ab.proto";
      message Foo {
        Common k1 = 1;
        a.Common k2 = 2;
        a.b.Common k3 = 3;
        Commonn k4 = 4;
        b.Common k5 = 5;
      }

      message Commonn {
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
          'base_a.proto': baseAContent,
          'base_aa.proto': baseAaContent,
          'base_ab.proto': baseAbContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base_a.Common',
        namespaceValue: 'a.Common',
      });

      expect(
        filterKeys(fields[1].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base_a.Common',
        namespaceValue: 'a.Common',
      });

      expect(
        filterKeys(fields[2].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base_ab.Common',
        namespaceValue: 'a_b.Common',
      });

      expect(
        filterKeys(fields[3].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Commonn',
        namespaceValue: 'a_b_c.Commonn',
      });

      expect(
        filterKeys(fields[4].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base_ab.Common',
        namespaceValue: 'a_b.Common',
      });
    });

    it('should resolve nested message and enum type in current file without a namespace', () => {
      const indexContent = `
      syntax = "proto3";

      message Foo {
        message FooSub {
          enum NumFoo {
            TWO = 2;
          }
        }

        Foo.FooSub.NumFoo k1 = 1;
        FooSub.NumFoo k2 = 2;
        FooSub k3 = 3;
        repeated FooSub k4 = 4;
        map<string, FooSub.NumFoo> k5 = 5;

        Bar.BarSub.NumBar k10 = 10;
        Bar.BarSub k11 = 11;
        repeated Bar.BarSub.NumBar k12 = 12;
        map<string, Bar.BarSub> k13 = 13;
      }

      message Bar {
        message BarSub {
          enum NumBar {
            ONE = 1;
          }
        }
      }

      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
        },
      );

      const message = document.statements[0] as t.InterfaceWithFields;
      const { nested, fields } = message;
      expect(nested && Object.keys(nested).length).to.equal(1);
      expect(fields[0].name.namespaceValue).to.equal('root.Foo.k1');
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Foo.FooSub.NumFoo',
        namespaceValue: 'root.Foo.FooSub.NumFoo',
      });

      expect(
        filterKeys(fields[1].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Foo.FooSub.NumFoo',
        namespaceValue: 'root.Foo.FooSub.NumFoo',
      });

      expect(
        filterKeys(fields[2].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Foo.FooSub',
        namespaceValue: 'root.Foo.FooSub',
      });

      expect(
        filterKeys((fields[3].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Foo.FooSub',
        namespaceValue: 'root.Foo.FooSub',
      });

      expect(
        filterKeys((fields[4].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Foo.FooSub.NumFoo',
        namespaceValue: 'root.Foo.FooSub.NumFoo',
      });

      expect(
        filterKeys(fields[5].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Bar.BarSub.NumBar',
        namespaceValue: 'root.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys(fields[6].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Bar.BarSub',
        namespaceValue: 'root.Bar.BarSub',
      });

      expect(
        filterKeys((fields[7].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Bar.BarSub.NumBar',
        namespaceValue: 'root.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys((fields[8].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Bar.BarSub',
        namespaceValue: 'root.Bar.BarSub',
      });
    });

    it('should resolve nested message and enum type in current file with a simple namespace', () => {
      const indexContent = `
      syntax = "proto3";
      package a;

      message Foo {
        message FooSub {
          enum NumFoo {
            TWO = 2;
          }
        }

        Foo.FooSub.NumFoo k1 = 1;
        FooSub.NumFoo k2 = 2;
        FooSub k3 = 3;
        repeated FooSub k4 = 4;
        map<string, FooSub.NumFoo> k5 = 5;

        Bar.BarSub.NumBar k10 = 10;
        Bar.BarSub k11 = 11;
        repeated Bar.BarSub.NumBar k12 = 12;
        map<string, Bar.BarSub> k13 = 13;
      }

      message Bar {
        message BarSub {
          enum NumBar {
            ONE = 1;
          }
        }
      }

      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(fields[0].name.namespaceValue).to.equal('a.Foo.k1');
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Foo.FooSub.NumFoo',
        namespaceValue: 'a.Foo.FooSub.NumFoo',
      });

      expect(
        filterKeys(fields[1].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Foo.FooSub.NumFoo',
        namespaceValue: 'a.Foo.FooSub.NumFoo',
      });

      expect(
        filterKeys(fields[2].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Foo.FooSub',
        namespaceValue: 'a.Foo.FooSub',
      });

      expect(
        filterKeys((fields[3].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Foo.FooSub',
        namespaceValue: 'a.Foo.FooSub',
      });

      expect(
        filterKeys((fields[4].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Foo.FooSub.NumFoo',
        namespaceValue: 'a.Foo.FooSub.NumFoo',
      });

      expect(
        filterKeys(fields[5].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Bar.BarSub.NumBar',
        namespaceValue: 'a.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys(fields[6].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Bar.BarSub',
        namespaceValue: 'a.Bar.BarSub',
      });

      expect(
        filterKeys((fields[7].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Bar.BarSub.NumBar',
        namespaceValue: 'a.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys((fields[8].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Bar.BarSub',
        namespaceValue: 'a.Bar.BarSub',
      });
    });

    it('should resolve nested message and enum type in current file with a dotted namespace', () => {
      const indexContent = `
      syntax = "proto3";
      package a.b;

      message Foo {
        message FooSub {
          enum NumFoo {
            TWO = 2;
          }
        }

        Foo.FooSub.NumFoo k1 = 1;
        FooSub.NumFoo k2 = 2;
        FooSub k3 = 3;
        repeated FooSub k4 = 4;
        map<string, FooSub.NumFoo> k5 = 5;

        Bar.BarSub.NumBar k10 = 10;
        Bar.BarSub k11 = 11;
        repeated Bar.BarSub.NumBar k12 = 12;
        map<string, Bar.BarSub> k13 = 13;
      }

      message Bar {
        message BarSub {
          enum NumBar {
            ONE = 1;
          }
        }
      }

      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(fields[0].name.namespaceValue).to.equal('a_b.Foo.k1');
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Foo.FooSub.NumFoo',
        namespaceValue: 'a_b.Foo.FooSub.NumFoo',
      });

      expect(
        filterKeys(fields[1].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Foo.FooSub.NumFoo',
        namespaceValue: 'a_b.Foo.FooSub.NumFoo',
      });

      expect(
        filterKeys(fields[2].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Foo.FooSub',
        namespaceValue: 'a_b.Foo.FooSub',
      });

      expect(
        filterKeys((fields[3].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Foo.FooSub',
        namespaceValue: 'a_b.Foo.FooSub',
      });

      expect(
        filterKeys((fields[4].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Foo.FooSub.NumFoo',
        namespaceValue: 'a_b.Foo.FooSub.NumFoo',
      });

      expect(
        filterKeys(fields[5].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Bar.BarSub.NumBar',
        namespaceValue: 'a_b.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys(fields[6].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'Bar.BarSub',
        namespaceValue: 'a_b.Bar.BarSub',
      });

      expect(
        filterKeys((fields[7].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Bar.BarSub.NumBar',
        namespaceValue: 'a_b.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys((fields[8].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'Bar.BarSub',
        namespaceValue: 'a_b.Bar.BarSub',
      });
    });

    it('should resolve nested message and enum type in an other file without a namespace', () => {
      const baseContent = `
      syntax = "proto3";

      message Bar {
        message BarSub {
          enum NumBar {
            ONE = 1;
          }
        }
      }
      `;

      const indexContent = `
      syntax = "proto3";
      import "base.proto";

      message Foo {
        Bar.BarSub.NumBar k10 = 10;
        Bar.BarSub k11 = 11;
        repeated Bar.BarSub.NumBar k12 = 12;
        map<string, Bar.BarSub> k13 = 13;
      }

      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
          'base.proto': baseContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Bar.BarSub.NumBar',
        namespaceValue: 'root.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys(fields[1].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Bar.BarSub',
        namespaceValue: 'root.Bar.BarSub',
      });

      expect(
        filterKeys((fields[2].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'base.Bar.BarSub.NumBar',
        namespaceValue: 'root.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys((fields[3].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'base.Bar.BarSub',
        namespaceValue: 'root.Bar.BarSub',
      });
    });

    it('should resolve nested message and enum type in an other file with a same namespace', () => {
      const baseContent = `
      syntax = "proto3";
      package a;

      message Bar {
        message BarSub {
          enum NumBar {
            ONE = 1;
          }
        }
      }
      `;

      const extraContent = `
      syntax = "proto3";
      package a;
      message Extra {}
      `;

      const indexContent = `
      syntax = "proto3";
      import "base.proto";
      import "extra.proto";
      package a;

      message Foo {
        a.Bar.BarSub.NumBar k10 = 10;
        Bar.BarSub k11 = 11;
        repeated a.Bar.BarSub.NumBar k12 = 12;
        map<string, Bar.BarSub> k13 = 13;
      }

      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
          'base.proto': baseContent,
          'extra.proto': extraContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Bar.BarSub.NumBar',
        namespaceValue: 'a.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys(fields[1].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Bar.BarSub',
        namespaceValue: 'a.Bar.BarSub',
      });

      expect(
        filterKeys((fields[2].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'base.Bar.BarSub.NumBar',
        namespaceValue: 'a.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys((fields[3].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'base.Bar.BarSub',
        namespaceValue: 'a.Bar.BarSub',
      });
    });

    it('should resolve nested message and enum type in an other file with a up namespace', () => {
      const baseContent = `
      syntax = "proto3";
      package a;

      message Bar {
        message BarSub {
          enum NumBar {
            ONE = 1;
          }
        }
      }
      `;

      const indexContent = `
      syntax = "proto3";
      import "base.proto";
      package a.b;

      message Foo {
        a.Bar.BarSub.NumBar k10 = 10;
        Bar.BarSub k11 = 11;
        repeated a.Bar.BarSub.NumBar k12 = 12;
        map<string, Bar.BarSub> k13 = 13;
      }

      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
          'base.proto': baseContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Bar.BarSub.NumBar',
        namespaceValue: 'a.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys(fields[1].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Bar.BarSub',
        namespaceValue: 'a.Bar.BarSub',
      });

      expect(
        filterKeys((fields[2].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'base.Bar.BarSub.NumBar',
        namespaceValue: 'a.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys((fields[3].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'base.Bar.BarSub',
        namespaceValue: 'a.Bar.BarSub',
      });
    });

    it('should resolve nested message and enum type in an other file with a down namespace', () => {
      const baseContent = `
      syntax = "proto3";
      package a.b;

      message Bar {
        message BarSub {
          enum NumBar {
            ONE = 1;
          }
        }
      }
      `;

      const indexContent = `
      syntax = "proto3";
      import "base.proto";
      package a;

      message Foo {
        a.b.Bar.BarSub.NumBar k10 = 10;
        b.Bar.BarSub k11 = 11;
        repeated a.b.Bar.BarSub.NumBar k12 = 12;
        map<string, b.Bar.BarSub> k13 = 13;
      }

      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
          'base.proto': baseContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Bar.BarSub.NumBar',
        namespaceValue: 'a_b.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys(fields[1].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'base.Bar.BarSub',
        namespaceValue: 'a_b.Bar.BarSub',
      });

      expect(
        filterKeys((fields[2].fieldType as t.ListType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'base.Bar.BarSub.NumBar',
        namespaceValue: 'a_b.Bar.BarSub.NumBar',
      });

      expect(
        filterKeys((fields[3].fieldType as t.MapType).valueType, [
          'value',
          'namespaceValue',
        ]),
      ).to.eql({
        value: 'base.Bar.BarSub',
        namespaceValue: 'a_b.Bar.BarSub',
      });
    });

    it('should resolve right file of similar type', () => {
      const priceContent = `
      syntax = "proto3";
      package promotion.data;
      message Product {}
      `;

      const campaignContent = `
      syntax = "proto3";
      package promotion.data;
      message ProductApproveInfo {}
      `;

      const indexContent = `
      syntax = "proto3";
      package promotion.serv;
      import "price.proto";
      import "campaign.proto";
      message SubmitProductRequest {
        promotion.data.ProductApproveInfo product_approve_info = 1;
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'index.proto': indexContent,
          'price.proto': priceContent,
          'campaign.proto': campaignContent,
        },
      );

      const { fields } = document.statements[0] as t.InterfaceWithFields;
      expect(
        filterKeys(fields[0].fieldType, ['value', 'namespaceValue']),
      ).to.eql({
        value: 'campaign.ProductApproveInfo',
        namespaceValue: 'promotion_data.ProductApproveInfo',
      });
    });
  });
});
