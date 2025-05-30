package plugin

import (
	"context"
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/go-playground/validator"
	"golang.org/x/mod/semver"
	"gopkg.in/yaml.v3"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/plugin"
	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type pluginProductMeta struct {
	PluginID       int64                  `yaml:"plugin_id" validate:"required"`
	ProductID      int64                  `yaml:"product_id" validate:"required"`
	Deprecated     bool                   `yaml:"deprecated"`
	Version        string                 `yaml:"version" validate:"required"`
	PluginType     common.PluginType      `yaml:"plugin_type" validate:"required"`
	OpenapiDocFile string                 `yaml:"openapi_doc_file" validate:"required"`
	Manifest       *entity.PluginManifest `yaml:"manifest" validate:"required"`
	Tools          []*toolProductMeta     `yaml:"tools" validate:"required"`
}

type toolProductMeta struct {
	ToolID     int64  `yaml:"tool_id" validate:"required"`
	Deprecated bool   `yaml:"deprecated"`
	Method     string `yaml:"method" validate:"required"`
	SubURL     string `yaml:"sub_url" validate:"required"`
}

var (
	pluginProducts map[int64]*PluginInfo
	toolProducts   map[int64]*ToolInfo
)

func GetToolProduct(toolID int64) (*ToolInfo, bool) {
	ti, ok := toolProducts[toolID]
	return ti, ok
}

func MGetToolProducts(toolIDs []int64) []*ToolInfo {
	tools := make([]*ToolInfo, 0, len(toolIDs))
	for _, toolID := range toolIDs {
		ti, ok := toolProducts[toolID]
		if !ok {
			continue
		}
		tools = append(tools, ti)
	}
	return tools
}

func GetPluginProduct(pluginID int64) (*PluginInfo, bool) {
	pl, ok := pluginProducts[pluginID]
	return pl, ok
}

func MGetPluginProducts(pluginIDs []int64) []*PluginInfo {
	plugins := make([]*PluginInfo, 0, len(pluginIDs))
	for _, pluginID := range pluginIDs {
		pl, ok := pluginProducts[pluginID]
		if !ok {
			continue
		}
		plugins = append(plugins, pl)
	}
	return plugins
}

func GetAllPluginProducts() []*PluginInfo {
	plugins := make([]*PluginInfo, 0, len(pluginProducts))
	for _, pl := range pluginProducts {
		plugins = append(plugins, pl)
	}
	return plugins
}

type PluginInfo struct {
	Info    *plugin.PluginInfo
	ToolIDs []int64
}

func (pi PluginInfo) GetPluginAllTools() (tools []*ToolInfo) {
	tools = make([]*ToolInfo, 0, len(pi.ToolIDs))
	for _, toolID := range pi.ToolIDs {
		ti, ok := toolProducts[toolID]
		if !ok {
			continue
		}
		tools = append(tools, ti)
	}
	return tools
}

type ToolInfo struct {
	Info *entity.ToolInfo
}

func loadPluginProductMeta(ctx context.Context, basePath string) (err error) {
	root := path.Join(basePath, "pluginproduct")
	metaFile := path.Join(root, "plugin_meta.yaml")

	file, err := os.ReadFile(metaFile)
	if err != nil {
		return fmt.Errorf("read file '%s' failed, err=%v", metaFile, err)
	}

	var pluginsMeta []*pluginProductMeta
	err = yaml.Unmarshal(file, &pluginsMeta)
	if err != nil {
		return fmt.Errorf("unmarshal file '%s' failed, err=%v", metaFile, err)
	}

	pluginProducts = make(map[int64]*PluginInfo, len(pluginsMeta))
	toolProducts = map[int64]*ToolInfo{}

	for _, m := range pluginsMeta {
		if m.Deprecated {
			continue
		}

		if !semver.IsValid(m.Version) {
			logs.Errorf("invalid version '%s'", m.Version)
			continue
		}
		if m.PluginID <= 0 {
			logs.Errorf("invalid plugin id '%d'", m.PluginID)
			continue
		}
		if m.ProductID <= 0 {
			logs.Errorf("invalid product id '%d'", m.ProductID)
			continue
		}
		_, ok := toolProducts[m.PluginID]
		if ok {
			logs.Errorf("duplicate plugin id '%d'", m.PluginID)
			continue
		}
		if m.PluginType != common.PluginType_PLUGIN {
			logs.Errorf("invalid plugin type '%s'", m.PluginType)
			continue
		}

		err = validator.New().Struct(m)
		if err != nil {
			logs.Errorf("plugin meta info validates failed, err=%v", err)
			continue
		}
		err = m.Manifest.Validate()
		if err != nil {
			logs.Errorf("plugin manifest validates failed, err=%v", err)
			continue
		}

		docPath := path.Join(root, m.OpenapiDocFile)
		loader := openapi3.NewLoader()
		_doc, err := loader.LoadFromFile(docPath)
		if err != nil {
			logs.Errorf("load file '%s', err=%v", docPath, err)
			continue
		}

		doc := ptr.Of(plugin.Openapi3T(*_doc))

		err = doc.Validate(ctx)
		if err != nil {
			logs.Errorf("the openapi3 doc '%s' validates failed, err=%v", m.OpenapiDocFile, err)
			continue
		}

		pi := &PluginInfo{
			Info: &plugin.PluginInfo{
				ID:           m.PluginID,
				RefProductID: &m.ProductID,
				PluginType:   m.PluginType,
				Version:      ptr.Of(m.Version),
				IconURI:      ptr.Of(m.Manifest.LogoURL),
				ServerURL:    ptr.Of(doc.Servers[0].URL),
				Manifest:     m.Manifest.PluginManifest,
				OpenapiDoc:   doc,
			},
			ToolIDs: make([]int64, 0, len(m.Tools)),
		}

		if pluginProducts[m.PluginID] != nil {
			logs.Errorf("duplicate plugin id '%d'", m.PluginID)
			continue
		}

		pluginProducts[m.PluginID] = pi

		apis := make(map[entity.UniqueToolAPI]*plugin.Openapi3Operation, len(doc.Paths))
		for subURL, pathItem := range doc.Paths {
			for method, op := range pathItem.Operations() {
				api := entity.UniqueToolAPI{
					SubURL: subURL,
					Method: strings.ToUpper(method),
				}
				apis[api] = ptr.Of(plugin.Openapi3Operation(*op))
			}
		}

		for _, t := range m.Tools {
			if t.Deprecated {
				continue
			}

			_, ok = toolProducts[t.ToolID]
			if ok {
				logs.Errorf("duplicate tool id '%d'", t.ToolID)
				continue
			}

			api := entity.UniqueToolAPI{
				SubURL: t.SubURL,
				Method: strings.ToUpper(t.Method),
			}
			op, ok := apis[api]
			if !ok {
				logs.Errorf("api '%s:%s' not found in doc '%s'", api.Method, api.SubURL, docPath)
				continue
			}
			if err = op.Validate(); err != nil {
				logs.Errorf("the openapi3 operation of tool '%s:%s' in '%s' validates failed, err=%v",
					t.Method, t.SubURL, m.OpenapiDocFile, err)
				continue
			}

			pi.ToolIDs = append(pi.ToolIDs, t.ToolID)

			toolProducts[t.ToolID] = &ToolInfo{
				Info: &entity.ToolInfo{
					ID:              t.ToolID,
					PluginID:        m.PluginID,
					Version:         ptr.Of(m.Version),
					Method:          ptr.Of(t.Method),
					SubURL:          ptr.Of(t.SubURL),
					Operation:       op,
					ActivatedStatus: ptr.Of(plugin.ActivateTool),
					DebugStatus:     ptr.Of(common.APIDebugStatus_DebugPassed),
				},
			}
		}

		if len(pi.ToolIDs) == 0 {
			delete(pluginProducts, m.PluginID)
		}
	}

	return nil
}
