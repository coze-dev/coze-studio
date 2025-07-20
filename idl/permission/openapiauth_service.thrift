include "../base.thrift"
include "./openapiauth.thrift"


namespace go permission.openapiauth

service OpenAPIAuthService {
    openapiauth.GetPersonalAccessTokenAndPermissionResponse GetPersonalAccessTokenAndPermission (1: openapiauth.GetPersonalAccessTokenAndPermissionRequest req) (api.get="/api/permission_api/pat/get_personal_access_token_and_permission")
    openapiauth.DeletePersonalAccessTokenAndPermissionResponse DeletePersonalAccessTokenAndPermission (1: openapiauth.DeletePersonalAccessTokenAndPermissionRequest req) (api.post="/api/permission_api/pat/delete_personal_access_token_and_permission")
    openapiauth.ListPersonalAccessTokensResponse ListPersonalAccessTokens (1: openapiauth.ListPersonalAccessTokensRequest req) (api.get="/api/permission_api/pat/list_personal_access_tokens")
    openapiauth.CreatePersonalAccessTokenAndPermissionResponse CreatePersonalAccessTokenAndPermission (1: openapiauth.CreatePersonalAccessTokenAndPermissionRequest req) (api.post="/api/permission_api/pat/create_personal_access_token_and_permission")
    openapiauth.UpdatePersonalAccessTokenAndPermissionResponse UpdatePersonalAccessTokenAndPermission (1: openapiauth.UpdatePersonalAccessTokenAndPermissionRequest req) (api.post="/api/permission_api/pat/update_personal_access_token_and_permission")
}