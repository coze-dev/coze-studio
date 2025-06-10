package plugin

import "github.com/getkin/kin-openapi/openapi3"

type PluginType string

const (
	PluginTypeOfCloud PluginType = "openapi"
)

type AuthType string

const (
	AuthTypeOfNone    AuthType = "none"
	AuthTypeOfService AuthType = "service_http"
	AuthTypeOfOAuth   AuthType = "oauth"
)

type AuthSubType string

const (
	AuthSubTypeOfServiceAPIToken        AuthSubType = "token/api_key"
	AuthSubTypeOfOAuthAuthorizationCode AuthSubType = "authorization_code"
	AuthSubTypeOfOAuthClientCredentials AuthSubType = "client_credentials"
)

type HTTPParamLocation string

const (
	ParamInHeader HTTPParamLocation = openapi3.ParameterInHeader
	ParamInPath   HTTPParamLocation = openapi3.ParameterInPath
	ParamInQuery  HTTPParamLocation = openapi3.ParameterInQuery
	ParamInBody   HTTPParamLocation = "body"
)

type ActivatedStatus int32

const (
	ActivateTool   ActivatedStatus = 0
	DeactivateTool ActivatedStatus = 1
)

type ProjectType int8

const (
	ProjectTypeOfBot ProjectType = 1
	ProjectTypeOfAPP ProjectType = 2
)

type ExecuteScene string

const (
	ExecSceneOfOnlineAgent ExecuteScene = "online_agent"
	ExecSceneOfDraftAgent  ExecuteScene = "draft_agent"
	ExecSceneOfWorkflow    ExecuteScene = "workflow"
	ExecSceneOfToolDebug   ExecuteScene = "tool_debug"
)

type InvalidResponseProcessStrategy int8

const (
	InvalidResponseProcessStrategyOfReturnRaw     InvalidResponseProcessStrategy = 0 // If the value of a field is invalid, the raw response value of the field is returned.
	InvalidResponseProcessStrategyOfReturnDefault InvalidResponseProcessStrategy = 1 // If the value of a field is invalid, the default value of the field is returned.
)

const (
	APISchemaExtendAssistType    = "x-assist-type"
	APISchemaExtendGlobalDisable = "x-global-disable"
	APISchemaExtendLocalDisable  = "x-local-disable"
	APISchemaExtendVariableRef   = "x-variable-ref"
)

type APIFileAssistType string

const (
	AssistTypeFile  APIFileAssistType = "file"
	AssistTypeImage APIFileAssistType = "image"
	AssistTypeDoc   APIFileAssistType = "doc"
	AssistTypePPT   APIFileAssistType = "ppt"
	AssistTypeCode  APIFileAssistType = "code"
	AssistTypeExcel APIFileAssistType = "excel"
	AssistTypeZIP   APIFileAssistType = "zip"
	AssistTypeVideo APIFileAssistType = "video"
	AssistTypeAudio APIFileAssistType = "audio"
	AssistTypeTXT   APIFileAssistType = "txt"
)
