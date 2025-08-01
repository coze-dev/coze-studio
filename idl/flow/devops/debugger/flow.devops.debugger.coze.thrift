namespace go flow.devops.debugger.coze

include "../../../base.thrift"
include "./domain/infra.thrift"
include "./domain/testcase.thrift"

// ========== TestCase =========== //
struct SaveCaseDataReq {
    1: optional infra.BizCtx bizCtx // business information
    2: optional infra.ComponentSubject bizComponentSubject
    3: optional testcase.CaseDataBase caseBase // Case basic data

    255: optional base.Base Base
}

struct SaveCaseDataResp {
    1: optional testcase.CaseDataDetail caseDetail

    253: optional i32            code
    254: optional string         msg
    255:  optional base.BaseResp BaseResp
}

struct DeleteCaseDataReq {
    1: optional infra.BizCtx bizCtx // business information
    2: optional list<i64> caseIDs // A single maximum of 20

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
    2: optional string caseName // Case name
    3: optional infra.ComponentSubject bizComponentSubject

    255: optional base.Base Base
}

struct CheckCaseDuplicateResp {
    1: optional bool isPass
    2: optional string failReason // When pass = false, give the specific reason why the check failed
    3: optional i32 failCode

    253: optional i32            code
    254: optional string         msg
    255:  optional base.BaseResp BaseResp
}

struct GetSchemaByIDReq {
    1: optional infra.BizCtx bizCtx // business information
    2: optional infra.ComponentSubject bizComponentSubject

    255: optional base.Base Base
}

struct GetSchemaByIDResp {
    1: optional string schemaJson // Component input information in JSON format, consistent with Input JSON Schema, does not contain Value information

    253: optional i32            code
    254: optional string         msg
    255: optional base.BaseResp BaseResp
}