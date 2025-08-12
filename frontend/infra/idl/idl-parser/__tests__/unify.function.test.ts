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
  describe('thrift function', () => {
    it('should convert function extensions', () => {
      const content = `
      service Foo {
        BizResponse Biz1(1: BizRequest req) (api.uri = '/api/biz1')
        BizResponse Biz2(1: BizRequest req) (
          api.uri = '/api/biz2',
          api.serializer = 'json',
          api.method = 'POST',
          api.group="user"
        )
        BizResponse Biz3(1: BizRequest req) (api.get = '/api/biz3', api.serializer='form')
        BizResponse Biz4(1: BizRequest req) (api.post = '/api/biz4', api.serializer='urlencoded')
        BizResponse Biz5(1: BizRequest req) (api.put = '/api/biz5', api.method = 'post', api.version='1')
        BizResponse Biz6(1: BizRequest req) (api.delete = '/api/biz6', api.serializer='wow', api.custom = '{"priority":1}')
        BizResponse Biz7(1: BizRequest req)
      }
      `;

      const expected = [
        { uri: '/api/biz1' },
        {
          uri: '/api/biz2',
          serializer: 'json',
          method: 'POST',
          group: 'user',
        },
        { method: 'GET', uri: '/api/biz3', serializer: 'form' },
        { method: 'POST', uri: '/api/biz4', serializer: 'urlencoded' },
        { method: 'PUT', uri: '/api/biz5', version: '1' },
        { method: 'DELETE', uri: '/api/biz6', custom: '{"priority":1}' },
        {},
      ];

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { functions } = document.statements[0] as t.ServiceDefinition;
      const extensionConfigs = functions.map(func => func.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert function extensions using agw specification', () => {
      const content = `
      service Foo {
        BizResponse Biz1(1: BizRequest req) (agw.uri = '/api/biz1')
        BizResponse Biz2(1: BizRequest req) (
          agw.uri = '/api/biz2',
          agw.method = 'POST',
        )
      }
      `;

      const expected = [
        { uri: '/api/biz1' },
        { uri: '/api/biz2', method: 'POST' },
      ];

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { functions } = document.statements[0] as t.ServiceDefinition;
      const extensionConfigs = functions.map(func => func.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should revise function comments', () => {
      const content = `
      service Foo {
        // c1
        BizResponse Biz1(1: BizRequest req) // c2
        /* c3 */
        BizResponse Biz2(1: BizRequest req) /* c4 */
        // c5
        /* c6 */
        BizResponse Biz3(1: BizRequest req) // c7
        /* c8
        c9 */
        BizResponse Biz4(1: BizRequest req)
        BizResponse Biz5(1: BizRequest req)
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
      const { functions } = document.statements[0] as t.ServiceDefinition;
      const comments = functions.map(func =>
        func.comments.map(comment => comment.value),
      );
      return expect(comments).to.eql(expected);
    });

    it('should resolve function name', () => {
      const content = `
      service Foo {
        BizResponse Biz1(1: BizRequest req) // c2
      }
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        { 'index.thrift': content },
      );
      const { functions } = document.statements[0] as t.ServiceDefinition;
      const { name } = functions[0];
      return expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Biz1',
        namespaceValue: 'root.Biz1',
      });
    });

    it('should resolve func type', () => {
      const baseContent = `
      namespace go test_base
      struct Response {}
      `;
      const funcContent = `
      include "./base.thrift"
      service Foo {
        base.Response Biz1(1: BizRequest req) // c2
      }
      `;

      const document = t.parse(
        'index.thrift',
        { cache: false },
        {
          'base.thrift': baseContent,
          'index.thrift': funcContent,
        },
      );

      const { functions } = document.statements[0] as t.ServiceDefinition;
      const identifier = functions[0].returnType as t.Identifier;
      return expect(filterKeys(identifier, ['value', 'namespaceValue'])).to.eql(
        {
          value: 'base.Response',
          namespaceValue: 'test_base.Response',
        },
      );
    });
  });

  describe('proto method', () => {
    it('should convert method extensions', () => {
      const content = `
      syntax = 'proto3';
      message BizRequest {}
      message BizResponse {}
      service Foo {
        rpc Biz1(BizRequest) returns (BizResponse) {
          option (api.uri) = '/api/biz1';
        }
        rpc Biz2(BizRequest) returns (BizResponse) {
          option (api.method) = "POST";
          option (api.uri) = "/api/biz2";
          option (api.serializer) = "json";
          option (api.group) = 'user';
        }
        rpc Biz3(BizRequest) returns (BizResponse) {
          option (api.get) ='/api/biz3';
          option (api.serializer) ='form';
        }
        rpc Biz4(BizRequest) returns (BizResponse) {
          option (api.post) ='/api/biz4';
          option (api.serializer) ='urlencoded';
        }
        rpc Biz5(BizRequest) returns (BizResponse) {
          option (api.put) ='/api/biz5';
        }
        rpc Biz6(BizRequest) returns (BizResponse) {
          option (api.delete) ='/api/biz6';
        }
        rpc Biz7(BizRequest) returns (BizResponse);
      }
      `;

      const expected = [
        { uri: '/api/biz1' },
        {
          method: 'POST',
          uri: '/api/biz2',
          serializer: 'json',
          group: 'user',
        },
        { method: 'GET', uri: '/api/biz3', serializer: 'form' },
        { method: 'POST', uri: '/api/biz4', serializer: 'urlencoded' },
        { method: 'PUT', uri: '/api/biz5' },
        { method: 'DELETE', uri: '/api/biz6' },
        {},
      ];

      const document = t.parse(
        'index.proto',
        { cache: false },
        { 'index.proto': content },
      );
      const { functions } = document.statements[2] as t.ServiceDefinition;
      const extensionConfigs = functions.map(func => func.extensionConfig);
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should resolve method name', () => {
      const content = `
      syntax = 'proto3';
      message BizRequest {}
      message BizResponse {}
      service Foo {
        rpc Biz1(BizRequest) returns (BizResponse) {
          option (api.uri) = '/api/biz1';
        }
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        { 'index.proto': content },
      );
      const { functions } = document.statements[2] as t.ServiceDefinition;
      const { name } = functions[0];
      return expect(filterKeys(name, ['value', 'namespaceValue'])).to.eql({
        value: 'Biz1',
        namespaceValue: 'root.Foo.Biz1',
      });
    });

    it('should resolve response type', () => {
      const baseContent = `
      syntax = 'proto3';
      package test_base;
      message Response {}
      `;

      const funcContent = `
      import "base.proto";
      syntax = 'proto3';
      message BizRequest {}
      service Foo {
        rpc Biz1(BizRequest) returns (test_base.Response) {
          option (api.uri) = '/api/biz1';
        }
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'base.proto': baseContent,
          'index.proto': funcContent,
        },
      );

      const { functions } = document.statements[1] as t.ServiceDefinition;
      const identifier = functions[0].returnType as t.Identifier;
      return expect(filterKeys(identifier, ['value', 'namespaceValue'])).to.eql(
        {
          value: 'base.Response',
          namespaceValue: 'test_base.Response',
        },
      );
    });

    it('should resolve response type within the same namespace', () => {
      const baseContent = `
      syntax = 'proto3';
      package same;
      message Response {}
      message Request {}
      `;

      const funcContent = `
      import "base.proto";
      syntax = 'proto3';
      package same;
      service Foo {
        rpc Biz1(Request) returns (same.Response) {
          option (api.uri) = '/api/biz1';
        }
      }
      `;

      const document = t.parse(
        'index.proto',
        { cache: false },
        {
          'base.proto': baseContent,
          'index.proto': funcContent,
        },
      );

      const { functions } = document.statements[0] as t.ServiceDefinition;
      const returnType = functions[0].returnType as t.Identifier;
      const requestType = functions[0].fields[0].fieldType as t.Identifier;
      expect(filterKeys(requestType, ['value', 'namespaceValue'])).to.eql({
        value: 'base.Request',
        namespaceValue: 'same.Request',
      });

      expect(filterKeys(returnType, ['value', 'namespaceValue'])).to.eql({
        value: 'base.Response',
        namespaceValue: 'same.Response',
      });
    });
  });
});
