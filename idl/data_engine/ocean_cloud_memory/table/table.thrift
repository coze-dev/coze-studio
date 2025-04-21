include "../../../base.thrift"

enum RefType {
    NoRef = 0
    Bot = 1
    ChatGroup = 2
}

struct RefInfo {
    1: RefType ref_type // 引用类型
    2: string ref_id // 引用 id
}
