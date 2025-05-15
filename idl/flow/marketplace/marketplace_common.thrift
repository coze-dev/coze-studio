include "../../base.thrift"
namespace go flow.marketplace.marketplace_common

struct Price {
    1: i64    Amount     (agw.key = "amount",agw.js_conv="str",agw.cli_conv="str"), // 金额
    2: string Currency   (agw.key = "currency")                                   , // 币种，如USD、CNY
    3: byte   DecimalNum (agw.key = "decimal_num")                                , // 小数位数
}

enum FollowType {
    Unknown      = 0, // 无关系
    Followee     = 1, // 关注
    Follower     = 2, // 粉丝
    MutualFollow = 3, // 互相关注
}