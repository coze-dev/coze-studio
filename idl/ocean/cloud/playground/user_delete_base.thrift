namespace py user_delete_base
namespace go user_delete_base

enum DataType {
    UNKNOWN = 0,                                    // 未知
    ORDINARY_PERSONAL_INFORMATION = 1,              // 普通个人信息,
    BASIC_PERSONAL_INFORMATION = 2,                 // 基本个人信息,
    PERSONAL_IDENTITY_INFORMATION = 3,              // 个人身份信息,
    PERSONAL_LOCATION_INFORMATION = 4,              // 个人位置信息,
    SYSTEM_OR_NETWORK_IDENTIFIER_INFORMATION = 5,   // 系统或网络标识符信息,
    PERSONAL_DEVICE_INFORMATION = 6,                // 个人设备信息,
    JOB_AND_EDUCATION_INFORMATION = 7,              // 职位和教育信息,
    PERSONAL_FINANCIAL_INFORMATION = 8,             // 个人财务信息,
    PERSONAL_SOCIAL_CONTACT_INFORMATION = 9,        // 个人社会联系信息,
    APPLICATION_INFORMATION = 10,                   // 应用信息,
    SERVICE_CONTENT_INFORMATION = 11,               // 服务内容信息,
    SERVICE_LOG_INFORMATION = 12,                   // 服务日志信息,
    PRODUCT_CONTENT_DATA = 13,                      // 产品内容数据,
    PERSONAL_BIOMETRIC_INFORMATION = 14,            // 个人生物特征信息,
    OTHERS = 15,                                    // 其他
}

enum UserDeleteScene {
    ACCOUNT_CANCEL = 0,         // 帐号注销
    APP_DATA_DELETION = 1,      // 应用数据删除
}

enum UserDeleteRespCode {
    TaskAcceptedSuccess = 100,                  // 任务受理成功，即开始执行
    TaskAcceptedFailed = 101,                   // 任务受理失败
    TaskExecutedSuccess = 102,                  // 任务执行成功
    TaskExecutedFailed = 103,                   // 任务执行失败

    VerifyUserDataExist = 200,                  // 用户数据存在
}

struct UserData {
    1: string Key,
    2: DataType DataType,
    3: string Data,
}

enum VerifyType {
    SoftDeleteVerify = 0,
    HardDeleteVerify = 1,
}

enum RestoreType {
    SoftRestore = 0,
    HardRestore = 1,
}

struct UserIdentifier  {
    1: i64 UserId
    2: list<i32> AppIds
    3: list<i64> DeviceIds
    4: list<string> IDFAs
    5: list<string> GAIDs
}
