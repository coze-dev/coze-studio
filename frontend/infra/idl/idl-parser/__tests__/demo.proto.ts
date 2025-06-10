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
