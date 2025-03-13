namespace go user
namespace py user
namespace java user

struct BaseResp {
    1: i64 code
    2: string message
}

struct RegisterRequest {
    1: string username (api.form="username", api.vd="(len($) > 0 && len($) < 128); msg:'Illegal format'")
    2: string password (api.form="password", api.vd="(len($) > 0 && len($) < 128); msg:'Illegal format'")
    3: string email (api.form="email", api.vd="(len($) > 0 && len($) < 128) && email($); msg:'Illegal format'")
}

struct RegisterResponse {
    1: BaseResp baseresp
}

service UserService {
    RegisterResponse register(1: RegisterRequest req) (api.post="/register")
}


