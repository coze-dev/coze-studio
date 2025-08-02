include "../base.thrift"
include "../app/bot_common.thrift"
namespace go file.upload
struct CommonUploadRequest {
    1: optional binary ByteData (api.raw_body = "")
    2: optional string uploadID (api.query="uploadID")
    3: optional string partNumber (api.query="partNumber")
}
struct Error{
    1: i32 code,
    2: string error,
    3: i32 error_code,
    4: string message
}
struct Payload{
    1: string hash,
    2: string key,
    3: string uploadID
}
struct CommonUploadResponse {
    1: string Version
    2: i32 success
    3: Error error
    4: Payload payload
}
struct ApplyUploadActionRequest {
    1: optional string Action (api.query="Action"),
    2: optional string Version (api.query="Version"),
    3: optional string ServiceId (api.query="ServiceId"),
    4: optional string FileExtension (api.query="FileExtension")
    5: optional string FileSize (api.query="FileSize")
    6: optional string s (api.query="s")
    7: optional binary ByteData (api.raw_body = "")
}
struct ResponseMetadata {
    1: required string RequestId,
    2: required string Action,
    3: required string Version,
    4: required string Service,
    5: required string Region
}
struct StoreInfo {
    1: required string StoreUri,
    2: required string Auth,
    3: required string UploadID
}
struct UploadAddress {
    1: required list<StoreInfo> StoreInfos,
    2: required list<string> UploadHosts,
    3: optional map<string, string> UploadHeader,
    4: required string SessionKey,
    5: required string Cloud
}
struct UploadNode {
    1: required list<StoreInfo> StoreInfos,
    2: required string UploadHost,
    3: optional map<string, string> UploadHeader,
    4: required string SessionKey
}
struct InnerUploadAddress {
    1: required list<UploadNode> UploadNodes
}
struct UploadResult {
    1: required string Uri,
    2: required i32 UriStatus
}
struct PluginResult {
    1: required string FileName,
    2: required string SourceUri,
    3: required string ImageUri,
    4: required i32 ImageWidth,
    5: required i32 ImageHeight,
    6: required string ImageMd5,
    7: required string ImageFormat,
    8: required i32 ImageSize,
    9: required i32 FrameCnt
}
struct ApplyUploadActionResult {
    1: optional UploadAddress UploadAddress,
    2: optional UploadAddress FallbackUploadAddress,
    3: optional InnerUploadAddress InnerUploadAddress,
    4: optional string RequestId,
    5: optional string SDKParam
    6: optional list<UploadResult> Results,
    7: optional list<PluginResult> PluginResult
}
struct ApplyUploadActionResponse {
    1: required ResponseMetadata ResponseMetadata,
    2: required ApplyUploadActionResult Result
}
service UploadService {
    CommonUploadResponse CommonUpload(1: CommonUploadRequest request)(api.post = '/api/common/upload/*tos_uri', api.category="upload", api.gen_path="upload")
    ApplyUploadActionResponse ApplyUploadAction(1: ApplyUploadActionRequest request)(api.get='/api/common/upload/apply_upload_action', api.post='/api/common/upload/apply_upload_action', api.category="common", api.gen_path="common")
}
