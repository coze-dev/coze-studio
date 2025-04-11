package entity

type DataType string

const (
	Object  DataType = "object"
	Number  DataType = "number"
	Integer DataType = "integer"
	String  DataType = "string"
	Array   DataType = "array"
	Null    DataType = "null"
	Boolean DataType = "boolean"
)

type HTTPParamLocation string

const (
	HTTPHeader HTTPParamLocation = "header"
	HTTPPath   HTTPParamLocation = "path"
	HTTPQuery  HTTPParamLocation = "query"
	HTTPBody   HTTPParamLocation = "body"
)

type HTTPMethod string

const (
	HTTPGet    HTTPMethod = "GET"
	HTTPPost   HTTPMethod = "POST"
	HTTPPut    HTTPMethod = "PUT"
	HTTPDelete HTTPMethod = "DELETE"
	HTTPPatch  HTTPMethod = "PATCH"
)

type ExecuteScene string

const (
	ExecSceneOfAgentOnline ExecuteScene = "agent_online"
	ExecSceneOfAgentDraft  ExecuteScene = "agent_draft"
	ExecSceneOfWorkflow    ExecuteScene = "workflow"
	ExecSceneOfToolDebug   ExecuteScene = "tool_debug"
)
