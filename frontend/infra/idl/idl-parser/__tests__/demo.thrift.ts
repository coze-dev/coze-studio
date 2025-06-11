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
    UNKNOWN = 0,  // 没有数据, 错误数据或者系统错误降级
    RANDOM = 1,   // 在修改 or 创建时，用户未指定 name 或者选中推荐的文字时，程序随机选择的头像
}
`;

const document = t.parse(idl);
var c = path.join('a/b.thrift', './c.thrift');
console.log(JSON.stringify(document, null, 2));
