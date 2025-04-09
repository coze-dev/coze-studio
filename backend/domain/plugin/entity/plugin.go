package entity

import (
	"github.com/getkin/kin-openapi/openapi3"
)

type PluginInfo struct {
	ID        int64
	Name      string
	Desc      string
	ServerURL string

	ToolsOpenAPI *openapi3.T
}
