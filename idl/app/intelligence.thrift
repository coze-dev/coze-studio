include "../base.thrift"
include "search.thrift"
include  "common_struct/intelligence_common_struct.thrift"
include  "common_struct/common_struct.thrift"
include  "project.thrift"
include  "publish.thrift"
include "task.thrift"

namespace go app.intelligence

service IntelligenceService {
    project.DraftProjectCreateResponse DraftProjectCreate(1: project.DraftProjectCreateRequest request)(api.post='/api/intelligence_api/draft_project/create', api.category="draft_project",agw.preserve_base="true")
    project.DraftProjectUpdateResponse DraftProjectUpdate(1: project.DraftProjectUpdateRequest request)(api.post='/api/intelligence_api/draft_project/update', api.category="draft_project",agw.preserve_base="true")
    project.DraftProjectDeleteResponse DraftProjectDelete(1: project.DraftProjectDeleteRequest request)(api.post='/api/intelligence_api/draft_project/delete', api.category="draft_project",agw.preserve_base="true")
    project.DraftProjectCopyResponse   DraftProjectCopy(1: project.DraftProjectCopyRequest request)(api.post='/api/intelligence_api/draft_project/copy', api.category="draft_project",agw.preserve_base="true")

    task.DraftProjectInnerTaskListResponse DraftProjectInnerTaskList(1: task.DraftProjectInnerTaskListRequest request)(api.post='/api/intelligence_api/draft_project/inner_task_list', api.category="draft_project",agw.preserve_base="true")

    search.GetDraftIntelligenceListResponse GetDraftIntelligenceList(1: search.GetDraftIntelligenceListRequest req) (api.post='/api/intelligence_api/search/get_draft_intelligence_list', api.category="search",agw.preserve_base="true")
    search.GetDraftIntelligenceInfoResponse GetDraftIntelligenceInfo(1: search.GetDraftIntelligenceInfoRequest req) (api.post='/api/intelligence_api/search/get_draft_intelligence_info', api.category="search",agw.preserve_base="true")
    search.GetUserRecentlyEditIntelligenceResponse GetUserRecentlyEditIntelligence(1: search.GetUserRecentlyEditIntelligenceRequest req) (api.post='/api/intelligence_api/search/get_recently_edit_intelligence', api.category="search",agw.preserve_base="true")

    publish.PublishConnectorListResponse ProjectPublishConnectorList(1: publish.PublishConnectorListRequest request)(api.post='/api/intelligence_api/publish/connector_list', api.category="publish",agw.preserve_base="true")
    publish.GetProjectPublishedConnectorResponse GetProjectPublishedConnector(1: publish.GetProjectPublishedConnectorRequest request) (api.post='/api/intelligence_api/publish/get_published_connector', api.category="publish",agw.preserve_base="true")
    publish.CheckProjectVersionNumberResponse CheckProjectVersionNumber(1: publish.CheckProjectVersionNumberRequest request)(api.post='/api/intelligence_api/publish/check_version_number', api.category="publish",agw.preserve_base="true")
    publish.PublishProjectResponse PublishProject(1: publish.PublishProjectRequest request)(api.post='/api/intelligence_api/publish/publish_project', api.category="publish",agw.preserve_base="true")
    publish.GetPublishRecordListResponse GetPublishRecordList(1: publish.GetPublishRecordListRequest request)(api.post='/api/intelligence_api/publish/publish_record_list', api.category="publish",agw.preserve_base="true")
    publish.GetPublishRecordDetailResponse GetPublishRecordDetail(1: publish.GetPublishRecordDetailRequest request)(api.post='/api/intelligence_api/publish/publish_record_detail', api.category="publish",agw.preserve_base="true")
}


