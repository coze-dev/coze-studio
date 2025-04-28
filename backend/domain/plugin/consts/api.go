package consts

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
	AssistTypePpt   APIFileAssistType = "ppt"
	AssistTypeCode  APIFileAssistType = "code"
	AssistTypeExcel APIFileAssistType = "excel"
	AssistTypeZip   APIFileAssistType = "zip"
	AssistTypeVideo APIFileAssistType = "video"
	AssistTypeAudio APIFileAssistType = "audio"
	AssistTypeTxt   APIFileAssistType = "txt"
	//AssistTypeVoice APIFileAssistType = "voice"
)

type HTTPParamLocation string

const (
	ParamInHeader HTTPParamLocation = "header"
	ParamInPath   HTTPParamLocation = "path"
	ParamInQuery  HTTPParamLocation = "query"
	ParamInBody   HTTPParamLocation = "body"
)

type AuthType int

const (
	AuthTypeNo      AuthType = 0
	AuthTypeService AuthType = 1
	AuthTypeUser    AuthType = 2
	AuthTypeOAuth   AuthType = 3
)
