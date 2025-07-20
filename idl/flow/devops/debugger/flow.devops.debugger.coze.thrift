namespace go flow.devops.debugger.coze

include "../../../base.thrift"
include "./domain/infra.thrift"
include "./domain/testcase.thrift"

// ========== TestCase =========== //
struct SaveCaseDataReq {
    1: optional infra.BizCtx bizCtx // 业务信息
    2: optional infra.ComponentSubject bizComponentSubject
    3: optional testcase.CaseDataBase caseBase // case基本数据

    255: optional base.Base Base
}

struct SaveCaseDataResp {
    1: optional testcase.CaseDataDetail caseDetail

    253: optional i32            code
    254: optional string         msg
    255:  optional base.BaseResp BaseResp
}

struct DeleteCaseDataReq {
    1: optional infra.BizCtx bizCtx // 业务信息
    2: optional list<i64> caseIDs // 单次上限20个

    255: optional base.Base Base
}

struct DeleteCaseDataResp {
   1: optional list<i64> deletedCaseIDS

   253: optional i32            code
   254: optional string         msg
   255:  optional base.BaseResp BaseResp
}

struct CheckCaseDuplicateReq {
    1: optional infra.BizCtx bizCtx
    2: optional string caseName // case名称
    3: optional infra.ComponentSubject bizComponentSubject

    255: optional base.Base Base
}

struct CheckCaseDuplicateResp {
    1: optional bool isPass
    2: optional string failReason // 当pass=false时，给出具体的校验不通过的原因
    3: optional i32 failCode

    253: optional i32            code
    254: optional string         msg
    255:  optional base.BaseResp BaseResp
}

struct GetSchemaByIDReq {
    1: optional infra.BizCtx bizCtx // 业务信息
    2: optional infra.ComponentSubject bizComponentSubject

    255: optional base.Base Base
}

struct GetSchemaByIDResp {
    1: optional string schemaJson // Json格式的组件input信息，与Input Json Schema保持一致，不包含Value值信息

    253: optional i32            code
    254: optional string         msg
    255: optional base.BaseResp BaseResp
}