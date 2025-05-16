package plugin

import (
	"context"
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/go-playground/validator"
	"gopkg.in/yaml.v3"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type officialPluginMeta struct {
	PluginID       int64                  `yaml:"plugin_id" validate:"required"`
	Deprecated     bool                   `yaml:"deprecated"`
	OpenapiDocFile string                 `yaml:"openapi_doc_file" validate:"required"`
	Manifest       *entity.PluginManifest `yaml:"manifest" validate:"required"`
	Tools          []*officialToolMeta    `yaml:"tools" validate:"required"`
}

type officialToolMeta struct {
	ToolID     int64  `yaml:"tool_id" validate:"required"`
	Deprecated bool   `yaml:"deprecated"`
	Method     string `yaml:"method" validate:"required"`
	SubURL     string `yaml:"sub_url" validate:"required"`
}

var (
	officialPlugins map[int64]*PluginInfo
	officialTools   map[int64]*ToolInfo
)

func GetOfficialPlugin(pluginID int64) (*PluginInfo, bool) {
	pl, ok := officialPlugins[pluginID]
	return pl, ok
}

func GetAllOfficialPlugins() []*PluginInfo {
	plugins := make([]*PluginInfo, 0, len(officialPlugins))
	for _, pl := range officialPlugins {
		plugins = append(plugins, pl)
	}
	return plugins
}

func GetOfficialTool(toolID int64) (*ToolInfo, bool) {
	ti, ok := officialTools[toolID]
	return ti, ok
}

func GetOfficialPluginAllTools(pluginID int64) (tools []*ToolInfo) {
	pl, ok := officialPlugins[pluginID]
	if !ok {
		return nil
	}
	return pl.GetPluginAllTools()
}

type PluginInfo struct {
	Info    *entity.PluginInfo
	ToolIDs []int64
}

func (pi PluginInfo) GetPluginAllTools() (tools []*ToolInfo) {
	tools = make([]*ToolInfo, 0, len(pi.ToolIDs))
	for _, toolID := range pi.ToolIDs {
		ti, ok := officialTools[toolID]
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

func loadOfficialPluginMeta(ctx context.Context, basePath string) (err error) {
	root := path.Join(basePath, "officialplugin")
	metaFile := path.Join(root, "plugin_meta.yaml")

	file, err := os.ReadFile(metaFile)
	if err != nil {
		return fmt.Errorf("read file '%s' failed, err=%v", metaFile, err)
	}

	var pluginsMeta []*officialPluginMeta
	err = yaml.Unmarshal(file, &pluginsMeta)
	if err != nil {
		return fmt.Errorf("unmarshal file '%s' failed, err=%v", metaFile, err)
	}

	officialPlugins = make(map[int64]*PluginInfo, len(pluginsMeta))
	officialTools = map[int64]*ToolInfo{}

	for _, m := range pluginsMeta {
		if m.Deprecated {
			continue
		}

		_, ok := officialTools[m.PluginID]
		if ok {
			logs.Errorf("duplicate plugin id '%d'", m.PluginID)
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

		doc := ptr.Of(entity.Openapi3T(*_doc))

		err = doc.Validate(ctx)
		if err != nil {
			logs.Errorf("the openapi3 doc '%s' validates failed, err=%v", m.OpenapiDocFile, err)
			continue
		}

		pi := &PluginInfo{
			ToolIDs: make([]int64, 0, len(m.Tools)),
			Info: &entity.PluginInfo{
				ID:         m.PluginID,
				ServerURL:  ptr.Of(doc.Servers[0].URL),
				Manifest:   m.Manifest,
				OpenapiDoc: doc,
			},
		}

		officialPlugins[m.PluginID] = pi

		apis := make(map[entity.UniqueToolAPI]*entity.Openapi3Operation, len(doc.Paths))
		for subURL, pathItem := range doc.Paths {
			for method, op := range pathItem.Operations() {
				api := entity.UniqueToolAPI{
					SubURL: subURL,
					Method: strings.ToLower(method),
				}
				apis[api] = ptr.Of(entity.Openapi3Operation(*op))
			}
		}

		for _, t := range m.Tools {
			if t.Deprecated {
				continue
			}

			_, ok = officialTools[t.ToolID]
			if ok {
				logs.Errorf("duplicate tool id '%d'", t.ToolID)
				continue
			}

			api := entity.UniqueToolAPI{
				SubURL: t.SubURL,
				Method: strings.ToLower(t.Method),
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

			officialTools[t.ToolID] = &ToolInfo{
				Info: &entity.ToolInfo{
					ID:              t.ToolID,
					PluginID:        m.PluginID,
					Method:          ptr.Of(t.Method),
					SubURL:          ptr.Of(t.SubURL),
					Operation:       op,
					ActivatedStatus: ptr.Of(consts.ActivateTool),
					DebugStatus:     ptr.Of(common.APIDebugStatus_DebugPassed),
				},
			}
		}

		if len(pi.ToolIDs) == 0 {
			delete(officialPlugins, m.PluginID)
		}
	}

	return nil
}
