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
  describe('proto method', () => {
    it('should convert method extensions', () => {
      const idl = `
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
        undefined,
      ];

      const document = t.parse(idl);
      const Foo = (document.root.nested || {}).Foo as t.ServiceDefinition;
      const extensionConfigs = Object.values(Foo.methods).map(
        func => func.extensionConfig,
      );
      return expect(extensionConfigs).to.eql(expected);
    });

    it('should convert method extensions using old rules', () => {
      const idl = `
      syntax = 'proto3';
      message BizRequest {}
      message BizResponse {}
      service Foo {
        rpc Biz1(BizRequest) returns (BizResponse) {
          option (api_method).get = "/api/biz1";
          option (api_method).serializer = "json";
        }

        rpc Biz2(BizRequest) returns (BizResponse) {
          option (pb_idl.api_method).post = "/api/biz2";
          option (pb_idl.api_method).serializer = "form";
        }
      }
      `;

      const expected = [
        { method: 'GET', uri: '/api/biz1', serializer: 'json' },
        { method: 'POST', uri: '/api/biz2', serializer: 'form' },
      ];

      const document = t.parse(idl);
      const Foo = (document.root.nested || {}).Foo as t.ServiceDefinition;
      const extensionConfigs = Object.values(Foo.methods).map(
        func => func.extensionConfig,
      );
      return expect(extensionConfigs).to.eql(expected);
    });
  });
});
