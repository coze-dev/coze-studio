include "../base.thrift"
include "search.thrift"
include  "common_struct/intelligence_common_struct.thrift"
include  "common_struct/common_struct.thrift"
include  "./project.thrift"

namespace go intelligence

service IntelligenceService {
    project.DraftProjectCreateResponse DraftProjectCreate(1: project.DraftProjectCreateRequest request)(api.post='/api/intelligence_api/draft_project/create', api.category="draft_project",agw.preserve_base="true")
    project.DraftProjectUpdateResponse DraftProjectUpdate(1: project.DraftProjectUpdateRequest request)(api.post='/api/intelligence_api/draft_project/update', api.category="draft_project",agw.preserve_base="true")
    project.DraftProjectDeleteResponse DraftProjectDelete(1: project.DraftProjectDeleteRequest request)(api.post='/api/intelligence_api/draft_project/delete', api.category="draft_project",agw.preserve_base="true")

    search.GetDraftIntelligenceListResponse GetDraftIntelligenceList(1: search.GetDraftIntelligenceListRequest req) (api.post='/api/intelligence_api/search/get_draft_intelligence_list', api.category="search",agw.preserve_base="true")
    search.GetDraftIntelligenceInfoResponse GetDraftIntelligenceInfo(1: search.GetDraftIntelligenceInfoRequest req) (api.post='/api/intelligence_api/search/get_draft_intelligence_info', api.category="search",agw.preserve_base="true")
    search.GetUserRecentlyEditIntelligenceResponse GetUserRecentlyEditIntelligence(1: search.GetUserRecentlyEditIntelligenceRequest req) (api.post='/api/intelligence_api/search/get_recently_edit_intelligence', api.category="search",agw.preserve_base="true")
    search.PublishIntelligenceListResponse PublishIntelligenceList(1: search.PublishIntelligenceListRequest req) (api.post='/api/intelligence_api/search/get_publish_intelligence_list', api.category="search",agw.preserve_base="true")
    search.GetProjectPublishSummaryResponse GetProjectPublishSummary(1: search.GetProjectPublishSummaryRequest req)(api.post='/api/intelligence_api/search/get_project_publish_summary', api.category="search",agw.preserve_base="true")
}


