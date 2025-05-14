package plugin

import (
	"os"
	"path"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"gopkg.in/yaml.v3"

	common "code.byted.org/flow/opencoze/backend/api/model/plugin_develop_common"
	"code.byted.org/flow/opencoze/backend/domain/plugin/consts"
	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type officialPluginMeta struct {
	PluginID       int64                  `yaml:"plugin_id"`
	Deprecated     bool                   `yaml:"deprecated"`
	OpenapiDocFile string                 `yaml:"openapi_doc_file"`
	Manifest       *entity.PluginManifest `yaml:"manifest"`
	Tools          []*officialToolMeta    `yaml:"tools"`
}

type officialToolMeta struct {
	ToolID     int64  `yaml:"tool_id"`
	Deprecated bool   `yaml:"deprecated"`
	Method     string `yaml:"method"`
	SubURL     string `yaml:"sub_url"`
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

func loadOfficialPluginMeta(basePath string) (err error) {
	root := path.Join(basePath, "plugin", "officialplugin")
	metaFile := path.Join(root, "plugin_meta.yaml")

	file, err := os.ReadFile(metaFile)
	if err != nil {
		logs.Errorf("read file '%s', err=%v", metaFile, err)
		return
	}

	var pluginsMeta []*officialPluginMeta
	err = yaml.Unmarshal(file, &pluginsMeta)
	if err != nil {
		logs.Errorf("unmarshal file '%s', err=%v", metaFile, err)
		return
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

		docPath := path.Join(root, m.OpenapiDocFile)
		loader := openapi3.NewLoader()
		doc, err := loader.LoadFromFile(docPath)
		if err != nil {
			logs.Errorf("load file '%s', err=%v", docPath, err)
			continue
		}

		if len(doc.Servers) != 1 {
			logs.Errorf("server is required and only one server is allowed, servers=%v", doc.Servers)
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

		apis := make(map[entity.UniqueToolAPI]*openapi3.Operation, len(doc.Paths))
		for subURL, pathItem := range doc.Paths {
			for method, operation := range pathItem.Operations() {
				api := entity.UniqueToolAPI{
					SubURL: subURL,
					Method: strings.ToLower(method),
				}
				apis[api] = operation
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
