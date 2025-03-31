namespace py base
namespace go base
namespace java com.bytedance.thrift.base

struct TrafficEnv {
    1: bool   Open = false,
    2: string Env  = ""   ,
}

struct Base {
    1:          string             LogID      = "",
    2:          string             Caller     = "",
    3:          string             Addr       = "",
    4:          string             Client     = "",
    5: optional TrafficEnv         TrafficEnv     ,
    6: optional map<string,string> Extra          ,
}

struct BaseResp {
    1:          string             StatusMessage = "",
    2:          i32                StatusCode    = 0 ,
    3: optional map<string,string> Extra             ,
}

struct EmptyReq {
}

struct EmptyData {}

struct EmptyResp {
    1: i64       code,
    2: string    msg ,
    3: EmptyData data,
}

struct EmptyRpcReq {
    255: optional Base Base,
}

struct EmptyRpcResp {
    255: optional BaseResp BaseResp,
}
