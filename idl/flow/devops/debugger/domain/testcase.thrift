namespace go flow.devops.debugger.domain.testcase

include "infra.thrift"

struct CaseDataBase {
     1: optional i64 caseID  (go.tag="json:\"caseID,string\"")// 新增时不填，更新时填写
     2: optional string name
     3: optional string description
     4: optional string input // json格式的输入信息
     5: optional bool isDefault
}


struct CaseDataDetail{
    1: optional CaseDataBase caseBase
    2: optional string creatorID
    3: optional i64 createTimeInSec
    4: optional i64 updateTimeInSec
    5: optional bool schemaIncompatible // schema不兼容
    6: optional infra.Creator updater,
}