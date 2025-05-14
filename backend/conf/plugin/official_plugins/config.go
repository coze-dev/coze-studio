package official_plugins

import (
	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type OfficialPluginMeta struct {
	PluginID       int64                  `yaml:"plugin_id"`
	OpenapiDocFile string                 `yaml:"openapi_doc_file"`
	OpenapiDoc     *openapi3.T            `yaml:"-"`
	Manifest       *entity.PluginManifest `yaml:"manifest"`
	Tools          []*OfficialToolMeta    `yaml:"tools"`
}

type OfficialToolMeta struct {
	ToolID    int64               `yaml:"tool_id"`
	Method    string              `yaml:"method"`
	SubURL    string              `yaml:"sub_url"`
	Operation *openapi3.Operation `yaml:"-"`
}
