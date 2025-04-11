package entity

import (
	"github.com/getkin/kin-openapi/openapi3"
)

type PluginInfo struct {
	ID      int64
	Name    string
	Desc    string
	IconURI string
	Version string

	ServerURL    string
	ToolsOpenAPI *openapi3.T
}
