namespace go resource.common

enum ResType{
    Plugin    = 1,
    Workflow  = 2,
    Imageflow = 3,
    Knowledge = 4,
    UI        = 5,
    Prompt    = 6,
    Database = 7,
    Variable = 8,
    Voice = 9,
}

enum PublishStatus {
    UnPublished = 1, // 未发布
    Published   = 2, // 已发布
}

enum ActionKey{
    Copy         = 1, // 复制
    Delete       = 2, // 删除
    EnableSwitch = 3, // 启用/禁用
    Edit         = 4, // 编辑
    SwitchToFuncflow = 8, // 切换成funcflow
    SwitchToChatflow = 9, // 切换成chatflow
    CrossSpaceCopy = 10, // 跨空间复制
}

enum ProjectResourceActionKey{
    Rename    = 1,        //重命名
    Copy  = 2,        //创建副本/复制到当前项目
    CopyToLibrary = 3,   //复制到资源库
    MoveToLibrary = 4,   //移动到资源库
    Delete  = 5,        //删除
    Enable = 6,   //启用
    Disable = 7,   //禁用
    SwitchToFuncflow = 8, // 切换成funcflow
    SwitchToChatflow = 9, // 切换成chatflow
    UpdateDesc = 10, // 修改描述
}

enum ProjectResourceGroupType{
    Workflow    = 1,
    Plugin  = 2,
    Data = 3,
}

enum ResourceCopyScene {
    CopyProjectResource    = 1,        //复制项目内的资源，浅拷贝
    CopyResourceToLibrary    = 2,        //复制项目资源到Library，复制后要发布
    MoveResourceToLibrary    = 3,        //移动项目资源到Library，复制后要发布，后置要删除项目资源
    CopyResourceFromLibrary    = 4,        //复制Library资源到项目
    CopyProject    = 5,                 //复制项目，连带资源要复制。复制当前草稿。
    PublishProject    = 6,              //项目发布到渠道，连带资源需要发布（含商店）。以当前草稿发布。
    CopyProjectTemplate    = 7,        // 复制项目模板。
    PublishProjectTemplate    = 8,        // 项目发布到模板，以项目的指定版本发布成临时模板。
    LaunchTemplate    = 9,        // 模板审核通过，上架，根据临时模板复制正式模板。
    ArchiveProject = 10,        //    草稿版本存档
    RollbackProject = 11,        // 线上版本加载到草稿，草稿版本加载到草稿
    CrossSpaceCopy    = 12,        // 单个资源跨空间复制
    CrossSpaceCopyProject = 13,        // 项目跨空间复制
}

// Library资源操作
struct ResourceAction{
    // 一个操作对应一个唯一的key，key由资源侧约束
    1: required ActionKey Key    (go.tag = "json:\"key\"", agw.key = "key")      ,
    //ture=可以操作该Action，false=置灰
    2: required bool      Enable (go.tag = "json:\"enable\"", agw.key = "enable"),
}

// 前端用
struct ResourceInfo{
    1 : optional i64                  ResID               (agw.js_conv="str", agw.key = "res_id", api.js_conv="true", api.body="res_id")         , // 资源id
    2 : optional ResType              ResType             (go.tag = "json:\"res_type\"", agw.key = "res_type")                        , // 资源类型
// 资源子类型，由资源实现方定义。
// Plugin：1-Http; 2-App; 6-Local；Knowledge：0-text; 1-table; 2-image；UI：1-Card
    3 : optional i32                  ResSubType          (go.tag = "json:\"res_sub_type\"", agw.key = "res_sub_type")                ,
    4 : optional string               Name                (go.tag = "json:\"name\"", agw.key = "name")                                , // 资源名称
    5 : optional string               Desc                (go.tag = "json:\"desc\"", agw.key = "desc")                                , // 资源描述
    6 : optional string               Icon                (go.tag = "json:\"icon\"", agw.key = "icon")                                , // 资源Icon，完整url
    7 : optional i64                  CreatorID           (agw.js_conv="str", agw.key = "creator_id", api.js_conv="true", api.body="creator_id") , // 资源创建者
    8 : optional string               CreatorAvatar       (go.tag = "json:\"creator_avatar\"", agw.key = "creator_avatar")            , // 资源创建者
    9 : optional string               CreatorName         (go.tag = "json:\"creator_name\"", agw.key = "creator_name")                , // 资源创建者
    10: optional string               UserName            (go.tag = "json:\"user_name\"", agw.key = "user_name")                      , // 资源创建者
    11: optional PublishStatus        PublishStatus       (go.tag = "json:\"publish_status\"", agw.key = "publish_status")            , // 资源发布状态，1-未发布，2-已发布
    12: optional i32                  BizResStatus        (go.tag = "json:\"biz_res_status\"", agw.key = "biz_res_status")            , // 资源状态，各类型资源自身定义
    13: optional bool                 CollaborationEnable (go.tag = "json:\"collaboration_enable\"", agw.key = "collaboration_enable"), // 是否开启多人编辑
    14: optional i64                  EditTime            (agw.key = "edit_time", api.js_conv="true", api.body="edit_time")                      , // 最近编辑时间, unix秒级时间戳
    15: optional i64                  SpaceID             (agw.js_conv="str", agw.key = "space_id", api.js_conv="true", api.body="space_id")     , // 资源所属空间ID
    16: optional map<string,string>   BizExtend           (go.tag = "json:\"biz_extend\"", agw.key = "biz_extend")                    , // 业务携带的扩展信息，以res_type区分，每个res_type定义的schema和含义不一样，使用前需要判断res_type
    17: optional list<ResourceAction> Actions             (go.tag = "json:\"actions\"", agw.key = "actions")                          , // 不同类型的不同操作按钮，由资源实现方和前端约定。返回则展示，要隐藏某个按钮，则不要返回；
    18: optional bool                 DetailDisable       (go.tag = "json:\"detail_disable\"", agw.key = "detail_disable")            , // 是否禁止进详情页
    19: optional bool                 DelFlag             (go.tag = "json:\"del_flag\"", agw.key = "del_flag")                        , // [数据延迟优化]删除标识符，true-已删除-前端隐藏该item，false-正常
}

struct ProjectResourceAction{
    // 一个操作对应一个唯一的key，key由资源侧约束
    1 : required ProjectResourceActionKey Key (go.tag = "json:\"key\"", agw.key = "key"),
    //ture=可以操作该Action，false=置灰
    2 : required bool Enable (go.tag = "json:\"enable\"", agw.key = "enable"),
    // enable=false时，提示文案。后端返回Starling Key，注意放在同一个space下。
    3: optional string Hint (go.tag = "json:\"hint\"", agw.key = "hint"),
}

// 实现方提供展示信息
struct ProjectResourceInfo{
    // 资源id
    1 : i64    ResID (api.js_conv="true", api.body="res_id", agw.js_conv="str", agw.key = "res_id")
     // 资源名称
    2 : string Name  (go.tag = "json:\"name\"", agw.key = "name")
    // 不同类型的不同操作按钮，由资源实现方和前端约定。返回则展示，要隐藏某个按钮，则不要返回；
    3 : list<ProjectResourceAction> Actions  (go.tag = "json:\"actions\"", agw.key = "actions"),
    // 该用户是否对资源只读
//    4: bool ReadOnly (go.tag = "json:\"read_only\"", agw.key = "read_only")
    // 资源类型
    5 : ResType ResType (go.tag = "json:\"res_type\"", agw.key = "res_type")     ,
    // 资源子类型，由资源实现方定义。Plugin：1-Http; 2-App; 6-Local；Knowledge：0-text; 1-table; 2-image；UI：1-Card
    6 : optional i32    ResSubType (go.tag = "json:\"res_sub_type\"", agw.key = "res_sub_type")      ,
     // 业务携带的扩展信息，以res_type区分，每个res_type定义的schema和含义不一样，使用前需要判断res_type
    7 : optional map<string, string> BizExtend (go.tag = "json:\"biz_extend\"", agw.key = "biz_extend"),
    // 资源状态，各类型资源自身定义。前端与各资源方约定。
    8 : optional i32   BizResStatus (go.tag = "json:\"biz_res_status\"", agw.key = "biz_res_status")      ,
    // 当前资源的编辑态版本
    9 : optional string VersionStr(go.tag = "json:\"version_str\"", agw.key = "version_str")
}

struct ProjectResourceGroup{
    1 : ProjectResourceGroupType GroupType (go.tag = "json:\"group_type\"", agw.key = "group_type")     ,  // 资源分组
    2 : optional list<ProjectResourceInfo> ResourceList (go.tag = "json:\"resource_list\"", agw.key = "resource_list"),
}

struct ResourceCopyFailedReason {
    1 : i64 ResID (agw.js_conv="str", agw.key = "res_id", api.js_conv="true", api.body="res_id")
    2 : ResType ResType (go.tag = "json:\"res_type\"", agw.key = "res_type")
    3 : string ResName (go.tag = "json:\"res_name\"", agw.key = "res_name")
    4 : string Reason (go.tag = "json:\"reason\"", agw.key = "reason")
    // 废弃
    5 : optional i64 PublishVersion(go.tag = "json:\"publish_version\"", agw.key = "publish_version")
    // 资源的当前版本，为nil或空字符串都看作是最新版本。项目发布版本或Library发布版本。
    6 : optional string PublishVersionStr(go.tag = "json:\"publish_version_str\"", agw.key = "publish_version_str")
}

enum TaskStatus{
    Successed = 1
    Processing = 2
    Failed = 3
    Canceled = 4
}

struct ResourceCopyTaskDetail{
    1: string task_id
    2: TaskStatus status // 任务状态
    3 : i64 res_id  (agw.js_conv="str", api.js_conv="true") // 复制后的资源id
    4 : ResType res_type
    5 : ResourceCopyScene scene,
    6: optional string res_name, // 复制前的资源名称
}
