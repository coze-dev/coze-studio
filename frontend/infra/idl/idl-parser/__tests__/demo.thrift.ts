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

import * as t from '../src/thrift';
import * as path from 'path';

const idl = `
/*
*/

struct UserDeleteDataMap {
    1: required UserDeleteData DeleteData
    2: string k2 (go.tag = 'json:\\"-\\"')
}

/*
We
*/
enum AvatarMetaType {
    UNKNOWN = 0,  // No data, incorrect data, or system error downgrade
    RANDOM = 1,   // When modifying or creating, the user does not specify a name or select the recommended text, the program randomly selects the avatar
}
`;

const document = t.parse(idl);
var c = path.join('a/b.thrift', './c.thrift');
console.log(JSON.stringify(document, null, 2));
