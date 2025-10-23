/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package consts

import "github.com/getkin/kin-openapi/openapi3"

type PluginType string

const (
	PluginTypeOfCloud  PluginType = "openapi"
	PluginTypeOfMCP    PluginType = "coze-studio-mcp"
	PluginTypeOfCustom PluginType = "coze-studio-custom"
)

type AuthzType string

const (
	AuthzTypeOfNone    AuthzType = "none"
	AuthzTypeOfService AuthzType = "service_http"
	AuthzTypeOfOAuth   AuthzType = "oauth"

	AuthTypeOfSaasInstalled AuthzType = "saas_installed"
)

type AuthzSubType string

const (
	AuthzSubTypeOfServiceAPIToken        AuthzSubType = "token/api_key"
	AuthzSubTypeOfOAuthAuthorizationCode AuthzSubType = "authorization_code"
	AuthzSubTypeOfOAuthClientCredentials AuthzSubType = "client_credentials"
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
	ProjectTypeOfAgent ProjectType = 1
	ProjectTypeOfAPP   ProjectType = 2
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
	InvalidResponseProcessStrategyOfReturnErr     InvalidResponseProcessStrategy = 2 // If the value of a field is invalid, error is returned.
)

const (
	APISchemaExtendAssistType    = "x-assist-type"
	APISchemaExtendGlobalDisable = "x-global-disable"
	APISchemaExtendLocalDisable  = "x-local-disable"
	APISchemaExtendVariableRef   = "x-variable-ref"
	APISchemaExtendAuthMode      = "x-auth-mode"
)

type ToolAuthMode string

const (
	ToolAuthModeOfRequired  ToolAuthMode = "required"
	ToolAuthModeOfSupported ToolAuthMode = "supported"
	ToolAuthModeOfDisabled  ToolAuthMode = "disabled"
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

type CopyScene string

const (
	CopySceneOfToAPP        CopyScene = "to_app"
	CopySceneOfToLibrary    CopyScene = "to_library"
	CopySceneOfDuplicate    CopyScene = "duplicate"
	CopySceneOfAPPDuplicate CopyScene = "app_duplicate"
)

type InterruptEventType string

const (
	InterruptEventTypeOfToolNeedOAuth InterruptEventType = "tool_need_oauth"
)

// MIME Type
const (
	MediaTypeJson           = "application/json"
	MediaTypeProblemJson    = "application/problem+json"
	MediaTypeFormURLEncoded = "application/x-www-form-urlencoded"
	MediaTypeXYaml          = "application/x-yaml"
	MediaTypeYaml           = "application/yaml"
)
