include "../../base.thrift"
namespace go flow.marketplace.marketplace_common

struct Price {
    1: i64    Amount     (agw.key = "amount",agw.js_conv="str",api.js_conv="true",agw.cli_conv="str",api.body= "amount"), // amount
    2: string Currency   (agw.key = "currency",api.body= "currency")                                   , // Currencies such as USD and CNY
    3: byte   DecimalNum (agw.key = "decimal_num",api.body= "decimal_num")                                , // decimal places
}

enum FollowType {
    Unknown      = 0, // Unknown
    Followee     = 1, // followee
    Follower     = 2, // follower
    MutualFollow = 3, // MutualFollow
}