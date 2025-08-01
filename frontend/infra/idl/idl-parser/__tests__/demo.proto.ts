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

import * as t from '../src/proto';

const content = `
syntax = 'proto3';

// c1
message Foo { // c2
  // c3
  int32 code = 1; // c4
  // c5
  string content = 2;
  // c6
  string message = 3; // c7
}
`;

const document = t.parse(content);
console.log(JSON.stringify(document, null, 2));
