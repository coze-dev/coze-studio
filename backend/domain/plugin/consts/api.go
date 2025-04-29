package consts

import (
	"github.com/getkin/kin-openapi/openapi3"
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

type HTTPParamLocation string

const (
	ParamInHeader HTTPParamLocation = openapi3.ParameterInHeader
	ParamInPath   HTTPParamLocation = openapi3.ParameterInPath
	ParamInQuery  HTTPParamLocation = openapi3.ParameterInQuery
	ParamInBody   HTTPParamLocation = "body"
)

type AuthType int

const (
	AuthTypeNo      AuthType = 0
	AuthTypeService AuthType = 1
	AuthTypeUser    AuthType = 2
	AuthTypeOAuth   AuthType = 3
)

// MIME Type
const (
	MIMETypeJson        = "application/json"
	MIMETypeProblemJson = "application/problem+json"
	MIMETypeJsonPatch   = "application/json-patch+json"
	MIMETypeForm        = "application/x-www-form-urlencoded"
	MIMETypeXYaml       = "application/x-yaml"
	MIMETypeYaml        = "application/yaml"
)
