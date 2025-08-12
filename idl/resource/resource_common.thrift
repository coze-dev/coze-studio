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
    UnPublished = 1, // unpublished
    Published   = 2, // Published
}

enum ActionKey{
    Copy         = 1, // copy
    Delete       = 2, // delete
    EnableSwitch = 3, // enable/disable
    Edit         = 4, // edit
    SwitchToFuncflow = 8, // Switch to funcflow
    SwitchToChatflow = 9, // Switch to chatflow
    CrossSpaceCopy = 10, // Cross-space copy
}

enum ProjectResourceActionKey{
    Rename    = 1,        //rename
    Copy  = 2,        //Create a copy/copy to the current project
    CopyToLibrary = 3,   //Copy to Library
    MoveToLibrary = 4,   //Move to Library
    Delete  = 5,        //delete
    Enable = 6,   //enable
    Disable = 7,   //disable
    SwitchToFuncflow = 8, // Switch to funcflow
    SwitchToChatflow = 9, // Switch to chatflow
    UpdateDesc = 10, // Modify description
}

enum ProjectResourceGroupType{
    Workflow    = 1,
    Plugin  = 2,
    Data = 3,
}

enum ResourceCopyScene {
    CopyProjectResource    = 1,        //Copy resources within the project, shallow copy
    CopyResourceToLibrary    = 2,        //Copy the project resources to the Library, and publish after copying
    MoveResourceToLibrary    = 3,        //Move project resources to Library, copy to publish, and delete project resources later
    CopyResourceFromLibrary    = 4,        //Copy Library Resources to Project
    CopyProject    = 5,                 //Copy the project, along with the resources. Copy the current draft.
    PublishProject    = 6,              //The project is published to the channel, and the associated resources need to be published (including the store). Publish with the current draft.
    CopyProjectTemplate    = 7,        // Copy the project template.
    PublishProjectTemplate    = 8,        // The project is published to a template, and the specified version of the project is published as a temporary template.
    LaunchTemplate    = 9,        // The template is approved, put on the shelves, and the official template is copied according to the temporary template.
    ArchiveProject = 10,        //    Draft version archive
    RollbackProject = 11,        // Online version loaded into draft, draft version loaded into draft
    CrossSpaceCopy    = 12,        // Cross-space copy of a single resource
    CrossSpaceCopyProject = 13,        // item cross-space copy
}

// Library Resource Operations
struct ResourceAction{
    // An operation corresponds to a unique key, and the key is constrained by the resource side
    1: required ActionKey Key    (go.tag = "json:\"key\"", agw.key = "key")      ,
    //ture = can operate this Action, false = grey out
    2: required bool      Enable (go.tag = "json:\"enable\"", agw.key = "enable"),
}

// front end
struct ResourceInfo{
    1 : optional i64                  ResID               (agw.js_conv="str", agw.key = "res_id", api.js_conv="true", api.body="res_id")         , // Resource ID
    2 : optional ResType              ResType             (go.tag = "json:\"res_type\"", agw.key = "res_type")                        , // resource type
// Resource subtype, defined by the resource implementer.
// Plugin：1-Http; 2-App; 6-Local；Knowledge：0-text; 1-table; 2-image；UI：1-Card
    3 : optional i32                  ResSubType          (go.tag = "json:\"res_sub_type\"", agw.key = "res_sub_type")                ,
    4 : optional string               Name                (go.tag = "json:\"name\"", agw.key = "name")                                , // resource name
    5 : optional string               Desc                (go.tag = "json:\"desc\"", agw.key = "desc")                                , // resource description
    6 : optional string               Icon                (go.tag = "json:\"icon\"", agw.key = "icon")                                , // Resource Icon, full url
    7 : optional i64                  CreatorID           (agw.js_conv="str", agw.key = "creator_id", api.js_conv="true", api.body="creator_id") , // Resource creator
    8 : optional string               CreatorAvatar       (go.tag = "json:\"creator_avatar\"", agw.key = "creator_avatar")            , // Resource creator
    9 : optional string               CreatorName         (go.tag = "json:\"creator_name\"", agw.key = "creator_name")                , // Resource creator
    10: optional string               UserName            (go.tag = "json:\"user_name\"", agw.key = "user_name")                      , // Resource creator
    11: optional PublishStatus        PublishStatus       (go.tag = "json:\"publish_status\"", agw.key = "publish_status")            , // Resource release status, 1 - unpublished, 2 - published
    12: optional i32                  BizResStatus        (go.tag = "json:\"biz_res_status\"", agw.key = "biz_res_status")            , // Resource status, each type of resource defines itself
    13: optional bool                 CollaborationEnable (go.tag = "json:\"collaboration_enable\"", agw.key = "collaboration_enable"), // Whether to enable multi-person editing
    14: optional i64                  EditTime            (agw.key = "edit_time", api.js_conv="true", api.body="edit_time")                      , // Last edited, unix timestamp
    15: optional i64                  SpaceID             (agw.js_conv="str", agw.key = "space_id", api.js_conv="true", api.body="space_id")     , // Resource Ownership Space ID
    16: optional map<string,string>   BizExtend           (go.tag = "json:\"biz_extend\"", agw.key = "biz_extend")                    , // Business carry extended information to res_type distinguish, each res_type defined schema and meaning is not the same, need to judge before use res_type
    17: optional list<ResourceAction> Actions             (go.tag = "json:\"actions\"", agw.key = "actions")                          , // Different types of different operation buttons are agreed upon by the resource implementer and the front end. Return is displayed, if you want to hide a button, do not return;
    18: optional bool                 DetailDisable       (go.tag = "json:\"detail_disable\"", agw.key = "detail_disable")            , // Whether to ban entering the details page
    19: optional bool                 DelFlag             (go.tag = "json:\"del_flag\"", agw.key = "del_flag")                        , // [Data delay optimization] Delete identifier, true-deleted-frontend hides the item, false-normal
}

struct ProjectResourceAction{
    // An operation corresponds to a unique key, and the key is constrained by the resource side
    1 : required ProjectResourceActionKey Key (go.tag = "json:\"key\"", agw.key = "key"),
    //ture = can operate this Action, false = grey out
    2 : required bool Enable (go.tag = "json:\"enable\"", agw.key = "enable"),
    // When enable = false, prompt the copywriter. The backend returns the Starling Key, be careful to put it under the same space.
    3: optional string Hint (go.tag = "json:\"hint\"", agw.key = "hint"),
}

// The implementer provides display information
struct ProjectResourceInfo{
    // Resource ID
    1 : i64    ResID (api.js_conv="true", api.body="res_id", agw.js_conv="str", agw.key = "res_id")
     // resource name
    2 : string Name  (go.tag = "json:\"name\"", agw.key = "name")
    // Different types of different operation buttons are agreed upon by the resource implementer and the front end. Return is displayed, if you want to hide a button, do not return;
    3 : list<ProjectResourceAction> Actions  (go.tag = "json:\"actions\"", agw.key = "actions"),
    // Is the user read-only to the resource?
//    4: bool ReadOnly (go.tag = "json:\"read_only\"", agw.key = "read_only")
    // resource type
    5 : ResType ResType (go.tag = "json:\"res_type\"", agw.key = "res_type")     ,
    // Resource subtype, defined by the resource implementer. Plugin: 1-Http; 2-App; 6-Local; Knowledge: 0-text; 1-table; 2-image; UI: 1-Card
    6 : optional i32    ResSubType (go.tag = "json:\"res_sub_type\"", agw.key = "res_sub_type")      ,
     // Business carry extended information to res_type distinguish, each res_type defined schema and meaning is not the same, need to judge before use res_type
    7 : optional map<string, string> BizExtend (go.tag = "json:\"biz_extend\"", agw.key = "biz_extend"),
    // Resource status, each type of resource defines itself. The front end agrees with each resource party.
    8 : optional i32   BizResStatus (go.tag = "json:\"biz_res_status\"", agw.key = "biz_res_status")      ,
    // The edited version of the current resource
    9 : optional string VersionStr(go.tag = "json:\"version_str\"", agw.key = "version_str")
}

struct ProjectResourceGroup{
    1 : ProjectResourceGroupType GroupType (go.tag = "json:\"group_type\"", agw.key = "group_type")     ,  // resource grouping
    2 : optional list<ProjectResourceInfo> ResourceList (go.tag = "json:\"resource_list\"", agw.key = "resource_list"),
}

struct ResourceCopyFailedReason {
    1 : i64 ResID (agw.js_conv="str", agw.key = "res_id", api.js_conv="true", api.body="res_id")
    2 : ResType ResType (go.tag = "json:\"res_type\"", agw.key = "res_type")
    3 : string ResName (go.tag = "json:\"res_name\"", agw.key = "res_name")
    4 : string Reason (go.tag = "json:\"reason\"", agw.key = "reason")
    // abandoned
    5 : optional i64 PublishVersion(go.tag = "json:\"publish_version\"", agw.key = "publish_version")
    // The current version of the resource, either nil or empty string, is considered the latest version. Project release or Library release.
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
    2: TaskStatus status // task status
    3 : i64 res_id  (agw.js_conv="str", api.js_conv="true") // Replicated resource id
    4 : ResType res_type
    5 : ResourceCopyScene scene,
    6: optional string res_name, // Resource name before copy
}
