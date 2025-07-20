include "../../base.thrift"
namespace go flow.marketplace.marketplace_common

struct Price {
    1: i64    Amount     (agw.key = "amount",agw.js_conv="str",api.js_conv="true",agw.cli_conv="str",api.body= "amount"), // 金额
    2: string Currency   (agw.key = "currency",api.body= "currency")                                   , // 币种，如USD、CNY
    3: byte   DecimalNum (agw.key = "decimal_num",api.body= "decimal_num")                                , // 小数位数
}

enum FollowType {
    Unknown      = 0, // 无关系
    Followee     = 1, // 关注
    Follower     = 2, // 粉丝
    MutualFollow = 3, // 互相关注
}