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

/* eslint-disable */

import * as t from '../src/unify/index';
import * as path from 'path';

// const root = 'test/idl';
// const idl = path.resolve(process.cwd(), root, 'dep/common.thrift');
// const document = t.parse(idl, {
//   root,
//   namespaceRefer: true,
//   cache: false,
// });
// // document.body[4]
// console.log('#gg', document);

const indexThriftContent = `
namespace java com.unify_idx

include 'unify_dependent1.thrift'

typedef unify_dependent1.Foo TFoo

enum Gender {
  // male
  Male // male tail
  // female
  Female // female tail
  // mix
  Mix
}

// const map<Gender, string> genderMap = {
//   Gender. Male: 'Male',
//   Gender. Female: 'Female',
// }

union FuncRequest {
  1: unify_dependent1.Foo r_key1
  2: TFoo list (go.tag = "json:\\"-\\"")
}
`;

const dep1ThriftContent = `
namespace js unify_dep1

typedef Foo Foo1

struct Foo {
  1: string f_key1
}

`;

// const fileContentMap = {
//   'unify_index.thrift': indexThriftContent,
//   'unify_dependent1.thrift': dep1ThriftContent,
// };

const indexProtoContent = `
syntax = "proto3";

import "unify.dependent1.proto";

package a.b.c;

message Request {
  repeated string key1 = 1[(api.key) = 'f'];
  a.b.Foo key3 = 3;
  // message Sub {
  //   enum Num {
  //     ONE = 1;
  //   }
  //   // string k1 = 1;
  //   Num k2 = 2;
  // }
  // Sub key2 = 2;
}
`;

const dep1ProtoContent = `
syntax = "proto3";

package a.b;

message Foo {
  string f_key1 = 1;
  message SubF {}
  SubF f_key2 = 2;
}
`;

const fileContentMap = {
  'unify_index.proto': indexProtoContent,
  'unify.dependent1.proto': dep1ProtoContent,
};

// const document = t.parse(
//   'unify_index.proto',
//   {
//     root: '.',
//     // namespaceRefer: true,
//   },
//   fileContentMap
// );
// // document.body[4]
// console.log(document);

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

const extraContent = `
syntax = "proto3";
package a.b;
message Extra {}
`;

const indexContent = `
      syntax = "proto3";

      package a.b;
      import 'base.proto';
      import 'extra.proto';

      message Foo {
      //   message FooSub {
      //     enum NumFoo {
      //       TWO = 2;
      //     }
      //   }

      //   Foo.FooSub.NumFoo k1 = 1;
      //   FooSub.NumFoo k2 = 2;
      //   FooSub k3 = 3;
      //   repeated FooSub k4 = 4;
      //   map<string, FooSub.NumFoo> k5 = 5;

      //   Bar.BarSub.NumBar k10 = 10;
        Bar.BarSub k11 = 11;
        // repeated Bar.BarSub.NumBar k12 = 12;
        // map<string, Bar.BarSub> k13 = 13;
      }

      // message Bar {
      //   message BarSub {
      //     enum NumBar {
      //       ONE = 1;
      //     }
      //   }
      // }
      
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
const statement = document.statements[0] as t.InterfaceWithFields;
console.log(statement);
// const baseContent = `
//       syntax = "proto3";
//       package a.b;
//       message Common {
//       }
//       `;

// const indexContent = `
// syntax = "proto3";
//       message Foo {
//         google.protobuf.Any k1 = 1;
//       }
//       `;

// const document = t.parse(
//   'index.proto',
//   { cache: false },
//   {
//     'index.proto': indexContent,
//     // 'base.proto': baseContent,
//   }
// );

// const { functions } = document.statements[0] as t.ServiceDefinition;
// console.log(functions);
