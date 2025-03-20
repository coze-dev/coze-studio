namespace go ocean.cloud.playground
include "../base.thrift"


// 运营后台idl


struct OpGetUserInfoRequest {
    1:  string user_id

    255: base.Base Base
}

struct OpGetUserInfoResponse {
    1:   OpUserInfo user_info  // 用户信息
    255: required base.BaseResp BaseResp
}


struct OpUserInfo {
    1: UserbasicInfo basic_info  // 用户基本信息
    2: UserPaymentInfo payment_info  // 付费信息
    3: UserProfessionalInfo professional_info  // 专业版信息
}

struct UserbasicInfo {
      1: string user_id
      2: string user_name // 用户名
      3: string email  // 邮箱
      4: string user_type  // 用户类型  内部用户/外部用户
      5: string registration_time // 注册时间
}

// 用户普通版付费信息
struct UserPaymentInfo {
    1: string   is_in_subscribe  // 是否订阅
}

// 用户专业版信息
struct UserProfessionalInfo {
    1: string   is_professional  // 是否专业版用户
    2: string volcano_openId  // 火山ID
}