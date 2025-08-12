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

import * as t from '../src/unify';

describe('unify-parser', () => {
  describe('thrift index', () => {
    it('should parse a simple file', () => {
      const idl = path.resolve(__dirname, 'idl/index.thrift');
      const expected = { uri_prefix: 'https://example.com' };

      const document = t.parse(idl, { cache: false });
      const { extensionConfig } = document.statements[0] as t.ServiceDefinition;
      return expect(extensionConfig).to.eql(expected);
    });

    it('should parse a complicate file', () => {
      const expected = {
        namespace: 'unify_idx',
        unifyNamespace: 'unify_idx',
        include: ['./unify_dependent1.thrift', 'unify_dependent2.thrift'],
      };

      const document = t.parse('unify_index.thrift', {
        root: path.resolve(__dirname, './idl'),
        namespaceRefer: false,
        cache: false,
      });
      const target = {
        namespace: document.namespace,
        unifyNamespace: document.unifyNamespace,
        include: document.includes,
      };

      return expect(target).to.eql(expected);
    });

    it('should parse a complicate file with relative path', () => {
      const expected = {
        include: ['base.thrift', 'basee.thrift'],
      };

      const document = t.parse('dep/common.thrift', {
        root: path.resolve(__dirname, './idl'),
        namespaceRefer: false,
        cache: false,
      });
      const target = {
        include: document.includes,
      };

      return expect(target).to.eql(expected);
    });

    it('should parse files from fileContentMap', () => {
      const indexContent = `
      include './unify_dependent.thrift'

      typedef unify_dependent.Foo TFoo

      union FuncRequest {
        1: unify_dependent.Foo r_key1
        2: TFoo r_key2
      }

      service Example {
        unify_dependent.FuncResponse Func(1: FuncRequest req)
      } (
      )
      `;
      const dependentContent = `
      typedef Foo Foo1

      struct Foo {
        1: string f_key1
      }

      struct FuncResponse {
      }
      `;
      const fileContentMap = {
        'unify_index.thrift': indexContent,
        'unify_dependent.thrift': dependentContent,
      };

      const expected = {
        namespace: '',
        unifyNamespace: 'root',
        include: ['./unify_dependent.thrift'],
      };

      const document = t.parse(
        'unify_index.thrift',
        { cache: false },
        fileContentMap,
      );
      const target = {
        namespace: document.namespace,
        unifyNamespace: document.unifyNamespace,
        include: document.includes,
      };

      return expect(target).to.eql(expected);
    });

    it('should parse files from fileContentMap with relative path', () => {
      const indexContent = `
      include 'unify_dependent.thrift'

      typedef unify_dependent.Foo TFoo

      union FuncRequest {
        1: unify_dependent.Foo r_key1
        2: TFoo r_key2
      }

      service Example {
        unify_dependent.FuncResponse Func(1: FuncRequest req)
      } (
      )
      `;
      const dependentContent = `
      typedef Foo Foo1

      struct Foo {
        1: string f_key1
      }

      struct FuncResponse {
      }
      `;
      const fileContentMap = {
        'relative/unify_index.thrift': indexContent,
        'relative/unify_dependent.thrift': dependentContent,
      };

      const expected = {
        namespace: '',
        unifyNamespace: 'root',
        include: ['unify_dependent.thrift'],
      };

      const document = t.parse(
        'relative/unify_index.thrift',
        { cache: false },
        fileContentMap,
      );
      const target = {
        namespace: document.namespace,
        unifyNamespace: document.unifyNamespace,
        include: document.includes,
      };

      return expect(target).to.eql(expected);
    });

    it('should parse files from fileContentMap and Java namespace', () => {
      const indexContent = `
      namespace java com.ferry.index

      union FuncRequest {
      }

      struct FuncResponse {}

      service Example {
        FuncResponse Func(1: FuncRequest req)
      } (
      )
      `;

      const fileContentMap = {
        'unify_index.thrift': indexContent,
      };

      const expected = {
        namespace: 'index',
        unifyNamespace: 'index',
        include: [],
      };

      const document = t.parse(
        'unify_index.thrift',
        { cache: false },
        fileContentMap,
      );
      const target = {
        namespace: document.namespace,
        unifyNamespace: document.unifyNamespace,
        include: document.includes,
      };

      return expect(target).to.eql(expected);
    });

    it('should parse files with cache', () => {
      const indexContent = `
      struct Foo {}
      `;
      const indexxContent = `
      `;

      const rootContent = `
      include "unify_index_cache.thrift"
      `;

      t.parse(
        'unify_index_cache.thrift',
        {
          cache: true,
        },
        {
          'unify_index_cache.thrift': indexContent,
        },
      );

      t.parse(
        'unify_root.thrift',
        { cache: false },
        {
          'unify_root.thrift': rootContent,
        },
      );

      const document = t.parse(
        'unify_index_cache.thrift',
        { cache: true },
        {
          'unify_index_cache.thrift': indexxContent,
        },
      );

      return expect(document.statements[0].name.value).to.eql('Foo');
    });

    it('should parse files with ignoreTag', () => {
      const indexContent = `
      struct Foo {
        1: string k1 (go.tag = "json:\\"key1\\"")
      }
      `;

      const document = t.parse(
        'unify_index.thrift',
        {
          ignoreGoTag: true,
        },
        {
          'unify_index.thrift': indexContent,
        },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;

      return expect(fields[0].extensionConfig).to.eql({});
    });

    it('should parse files with goTagDash', () => {
      const indexContent = `
      struct Foo {
        1: string k1 (go.tag = "json:\\"-\\"")
      }
      `;

      const document = t.parse(
        'unify_index.thrift',
        {},
        {
          'unify_index.thrift': indexContent,
        },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;

      return expect(fields.length).to.eql(0);
    });

    it('should parse files with ignoreTagDash', () => {
      const indexContent = `
      struct Foo {
        1: string k1 (go.tag = "json:\\"-\\"")
      }
      `;

      const document = t.parse(
        'unify_index.thrift',
        {
          ignoreGoTagDash: true,
        },
        {
          'unify_index.thrift': indexContent,
        },
      );
      const { fields } = document.statements[0] as t.InterfaceWithFields;

      return expect(fields.length).to.eql(1);
    });

    it('should search files from searchPaths', () => {
      const idl = path.resolve(__dirname, 'idl/unify_search.thrift');
      const depDir = path.resolve(__dirname, 'idl/dep');

      const document = t.parse(idl, {
        cache: false,
        searchPaths: [depDir],
      });

      const struct = document.statements[0] as t.InterfaceWithFields;
      return expect(struct.type).to.eql(t.SyntaxType.StructDefinition);
    });

    it('should search files from relative searchPaths', () => {
      const document = t.parse('unify_search.thrift', {
        root: path.resolve(__dirname, 'idl'),
        cache: false,
        searchPaths: ['./dep'],
      });

      const struct = document.statements[0] as t.InterfaceWithFields;
      return expect(struct.type).to.eql(t.SyntaxType.StructDefinition);
    });

    it('should parse files with a syntax error', () => {
      const indexContent = `
      struct
      `;

      try {
        t.parse(
          'error.thrift',
          { cache: false },
          {
            'error.thrift': indexContent,
          },
        );
      } catch (err) {
        return expect(err.message).to.eql(
          'Struct-like must have an identifier',
        );
      }

      return expect(0).to.eql(1);
    });

    it('should parse files with a dependent file error within fileContentMap', () => {
      const indexContent = `
      include "./dependent.thrift"
      `;

      try {
        t.parse(
          'error.thrift',
          { cache: false },
          {
            'error.thrift': indexContent,
          },
        );
      } catch (err) {
        return expect(err.message).to.eql(
          'file dependent.thrift does not exist in fileContentMap',
        );
      }

      return expect(0).to.eql(1);
    });

    it('should parse files with a entry file error within fileContentMap', () => {
      try {
        t.parse('specify_error.thrift', { cache: false }, {});
      } catch (err) {
        return expect(err.message).to.equal(
          'file "specify_error.thrift" does not exist in fileContentMap',
        );
      }

      return expect(0).to.eql(1);
    });

    it('should parse files with a entry file error', () => {
      const idl = path.resolve(__dirname, 'idl/special_error.thrift');

      try {
        t.parse(idl, { cache: false });
      } catch (err) {
        return expect(err.message).to.contain('no such file:');
      }

      return expect(0).to.eql(1);
    });

    it('should parse files with a dependent file error', () => {
      const idl = path.resolve(__dirname, 'idl/unify_error.thrift');

      try {
        t.parse(idl, { cache: false });
      } catch (err) {
        return expect(err.message).to.contain('does not exist');
      }

      return expect(0).to.eql(1);
    });

    it('should parse files with a namespace error', () => {
      const indexContent = `
      namespace java1 com.index
      `;

      try {
        t.parse(
          'error.thrift',
          { cache: false },
          {
            'error.thrift': indexContent,
          },
        );
      } catch (err) {
        return expect(err.message).to.eql('a js namespace should be specifed');
      }

      return expect(0).to.eql(1);
    });
  });

  describe('proto index', () => {
    it('should a simple file', () => {
      const idl = path.resolve(__dirname, 'idl/index.proto');
      const expected = { uri_prefix: '//example.com' };
      const document = t.parse(idl, { cache: false });
      const { extensionConfig } = document.statements[0] as t.ServiceDefinition;
      return expect(extensionConfig).to.eql(expected);
    });

    it('should parse a complicate file', () => {
      const expected = {
        namespace: 'unify_idx',
        unifyNamespace: 'unify_idx',
        include: ['./unify_dependent1.proto', 'unify_dependent2.proto'],
      };

      const document = t.parse('unify_index.proto', {
        root: path.resolve(__dirname, './idl'),
        namespaceRefer: false,
        cache: false,
      });
      const target = {
        namespace: document.namespace,
        unifyNamespace: document.unifyNamespace,
        include: document.includes,
      };

      return expect(target).to.eql(expected);
    });

    it('should parse a complicate file with relative path', () => {
      const expected = {
        include: ['base.proto', 'basee.proto'],
      };

      const document = t.parse('dep/common.proto', {
        root: path.resolve(__dirname, './idl'),
        namespaceRefer: false,
        cache: false,
      });
      const target = {
        include: document.includes,
      };

      return expect(target).to.eql(expected);
    });

    it('should parse files from fileContentMap', () => {
      const indexContent = `
      syntax = "proto3";
      import "./unify_dependent.proto";

      message Request {
        repeated string key1 = 1[(api.key) = 'f'];
        unify_dep3.Foo key2 = 2;
      }

      service Example {
        option (api.uri_prefix) = "//example.com";
        rpc Biz1(Request) returns (unify_dep3.Response) {
          option (api.uri) = '/api/biz1';
        }
      }
      `;
      const dependentContent = `
      syntax = "proto3";

      package unify_dep3;

      message Foo {
        string f_key1 = 1;
      }

      message Response {}
      `;
      const fileContentMap = {
        'unify_index.proto': indexContent,
        'unify_dependent.proto': dependentContent,
      };

      const expected = {
        namespace: '',
        unifyNamespace: 'root',
        include: ['./unify_dependent.proto'],
      };

      const document = t.parse(
        'unify_index.proto',
        { cache: false },
        fileContentMap,
      );
      const target = {
        namespace: document.namespace,
        unifyNamespace: document.unifyNamespace,
        include: document.includes,
      };

      return expect(target).to.eql(expected);
    });

    it('should parse files from fileContentMap with relative path', () => {
      const indexContent = `
      syntax = "proto3";
      import "unify_dependent.proto";

      message Request {
        repeated string key1 = 1[(api.key) = 'f'];
        unify_dep3.Foo key2 = 2;
      }

      service Example {
        option (api.uri_prefix) = "//example.com";
        rpc Biz1(Request) returns (unify_dep3.Response) {
          option (api.uri) = '/api/biz1';
        }
      }
      `;
      const dependentContent = `
      syntax = "proto3";

      package unify_dep3;

      message Foo {
        string f_key1 = 1;
      }

      message Response {}
      `;
      const fileContentMap = {
        'relative/unify_index.proto': indexContent,
        'relative/unify_dependent.proto': dependentContent,
      };

      const expected = {
        namespace: '',
        unifyNamespace: 'root',
        include: ['unify_dependent.proto'],
      };

      const document = t.parse(
        'relative/unify_index.proto',
        { cache: false },
        fileContentMap,
      );
      const target = {
        namespace: document.namespace,
        unifyNamespace: document.unifyNamespace,
        include: document.includes,
      };

      return expect(target).to.eql(expected);
    });

    it('should parse files with cache', () => {
      const indexContent = `
      syntax = "proto3";
      message Foo {}
      `;
      const indexxContent = `
      syntax = "proto3";
      `;

      const rootContent = `
      import "unify_index_cache.proto";
      syntax = "proto3";
      `;

      t.parse(
        'unify_index_cache.proto',
        {
          cache: true,
        },
        {
          'unify_index_cache.proto': indexContent,
        },
      );

      t.parse(
        'unify_root.proto',
        { cache: false },
        {
          'unify_root.proto': rootContent,
        },
      );

      const document = t.parse(
        'unify_index_cache.proto',
        { cache: true },
        {
          'unify_index_cache.proto': indexxContent,
        },
      );

      return expect(document.statements[0].name.value).to.eql('Foo');
    });

    it('should parse files ignoring import', () => {
      const indexContent = `
      syntax = "proto3";
      import "google/protobuf/api.proto";
      `;

      t.parse(
        'ignore.proto',
        { cache: false },
        {
          'ignore.proto': indexContent,
        },
      );
    });

    it('should search files from searchPaths', () => {
      const idl = path.resolve(__dirname, 'idl/unify_search.proto');
      const depDir = path.resolve(__dirname, 'idl/dep');

      const document = t.parse(idl, {
        cache: false,
        searchPaths: [depDir],
      });

      const struct = document.statements[0] as t.InterfaceWithFields;
      return expect(struct.type).to.eql(t.SyntaxType.StructDefinition);
    });

    it('should search files from relative searchPaths', () => {
      const document = t.parse('unify_search.proto', {
        root: path.resolve(__dirname, 'idl'),
        cache: false,
        searchPaths: ['./dep'],
      });

      const struct = document.statements[0] as t.InterfaceWithFields;
      return expect(struct.type).to.eql(t.SyntaxType.StructDefinition);
    });

    it('should parse files with a syntax error', () => {
      const indexContent = `
      syntax = "proto3";
      message Foo {
      `;

      try {
        t.parse(
          'error.proto',
          { cache: false },
          {
            'error.proto': indexContent,
          },
        );
      } catch (err) {
        return expect(err.message).to.eql("illegal token 'null', '=' expected");
      }

      return expect(0).to.eql(1);
    });

    it('should parse files with a entry file error within fileContentMap', () => {
      try {
        t.parse('specify_error.proto', { cache: false }, {});
      } catch (err) {
        return expect(err.message).to.equal(
          'file "specify_error.proto" does not exist in fileContentMap',
        );
      }

      return expect(0).to.eql(1);
    });

    it('should parse files with a file error', () => {
      const indexContent = `
      syntax = "proto3";
      import "./dependent.proto";
      `;

      try {
        t.parse(
          'error.proto',
          { cache: false },
          {
            'error.proto': indexContent,
          },
        );
      } catch (err) {
        return expect(err.message).to.eql(
          'file dependent.proto does not exist in fileContentMap',
        );
      }

      return expect(0).to.eql(1);
    });

    it('should parse files with a real file error', () => {
      try {
        t.parse('real_error.proto', { cache: false });
      } catch (err) {
        return expect(err.message).to.contain('no such file');
      }

      return expect(0).to.eql(1);
    });
  });

  describe('all index', () => {
    it('should parse files with a file error', () => {
      try {
        t.parse('error', { cache: false });
      } catch (err) {
        return expect(err.message).to.eql('invalid filePath: "error"');
      }

      return expect(0).to.eql(1);
    });
  });
});
