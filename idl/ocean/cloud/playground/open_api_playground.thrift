namespace go ocean.cloud.playground
include "../base.thrift"

/*
*  plagyground 开放api idl文件
* */

struct OpenSpaceListRequest {
    1 : i64 page_num (api.query = "page_num", agw.source = "query", agw.key = "page_num")
    2 : i64 page_size (api.query = "page_size", agw.source = "query", agw.key = "page_size")
    255: base.Base Base
}

struct OpenSpaceListResponse {

    3 : OpenSpaceData data

    253: required i64    code
    254: required string msg
    255: base.BaseResp BaseResp
}

struct OpenSpaceData {
    1 : list<OpenSpace> workspaces
    2 : i64 total_count // 空间总数
}

struct OpenSpace {
     1  :  string  id                // 空间 id
     2  :  string  name              // 空间名称
     3  :  string  icon_url          // 空间图标 url
     4  :  string  role_type         // 当前用户角色, 枚举值: owner, admin, member
     5  :  string  workspace_type    // 工作空间类型, 枚举值: personal, team
}
