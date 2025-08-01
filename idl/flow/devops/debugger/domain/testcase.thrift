namespace go flow.devops.debugger.domain.testcase

include "infra.thrift"

struct CaseDataBase {
     1: optional i64 caseID  (go.tag="json:\"caseID,string\"")// Do not fill in when adding, fill in when updating
     2: optional string name
     3: optional string description
     4: optional string input // Input information in JSON format
     5: optional bool isDefault
}


struct CaseDataDetail{
    1: optional CaseDataBase caseBase
    2: optional string creatorID
    3: optional i64 createTimeInSec
    4: optional i64 updateTimeInSec
    5: optional bool schemaIncompatible // Schema incompatibility
    6: optional infra.Creator updater,
}