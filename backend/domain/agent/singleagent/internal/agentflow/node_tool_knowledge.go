package agentflow

import (
	"context"
	"fmt"
	"reflect"
	"strconv"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/components/tool/utils"
	"github.com/cloudwego/eino/schema"
	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	knowledgeEntity "code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
)

const (
	knowledgeToolName = "recallKnowledge"
	knowledgeDesc     = `Provides multiple retrieval methods to search for content fragments stored in the knowledge base, helping the large model obtain more accurate and reliable context information`
)

type knowledgeConfig struct {
	knowledgeInfos  []*knowledgeEntity.Knowledge
	knowledgeConfig *bot_common.Knowledge
	Knowledge       crossdomain.Knowledge
	Input           *schema.Message
	GetHistory      func() []*schema.Message
}

func newKnowledgeTool(ctx context.Context, conf *knowledgeConfig) (tool.InvokableTool, error) {
	kl := &knowledgeTool{
		knowledgeConfig: conf.knowledgeConfig,
		Input:           conf.Input,
		GetHistory:      conf.GetHistory,
		svr:             conf.Knowledge,
	}

	customTagsFn := func(name string, t reflect.Type, tag reflect.StructTag,
		schema *openapi3.Schema,
	) error {
		// Process KnowledgeIDs field only
		if name != "KnowledgeIDs" {
			return nil
		}

		// Build knowledge base description
		desc := "Available Knowledge Base List as format knowledge_id: knowledge_name - knowledge_description: \n"
		for _, k := range conf.knowledgeInfos {
			desc += fmt.Sprintf("- %d: %s - %s\n", k.ID, k.Name, k.Description)
		}

		schema.Type = openapi3.TypeArray
		schema.Items = &openapi3.SchemaRef{
			Value: &openapi3.Schema{
				Type: openapi3.TypeInteger,
			},
		}
		// 设置字段描述和枚举值
		schema.Description = desc
		schema.Enum = make([]interface{}, 0, len(conf.knowledgeInfos))
		for _, k := range conf.knowledgeInfos {
			schema.Enum = append(schema.Enum, strconv.FormatInt(k.ID, 10))
		}

		return nil
	}

	return utils.InferTool(knowledgeToolName, knowledgeDesc, kl.Retrieve, utils.WithSchemaCustomizer(customTagsFn))
}

type RetrieveRequest struct {
	KnowledgeIDs []int64 `json:"knowledge_ids" jsonschema:"description="`
}

type knowledgeTool struct {
	svr             crossdomain.Knowledge
	knowledgeConfig *bot_common.Knowledge
	Input           *schema.Message
	GetHistory      func() []*schema.Message
}

func (k *knowledgeTool) Retrieve(ctx context.Context, req *RetrieveRequest) ([]*schema.Document, error) {
	rr, err := genKnowledgeRequest(ctx, req.KnowledgeIDs, k.knowledgeConfig, k.Input.Content, k.GetHistory())
	if err != nil {
		return nil, err
	}

	docSlices, err := k.svr.Retrieve(ctx, rr)
	if err != nil {
		return nil, err
	}

	docs, err := convertDocument(ctx, docSlices)
	if err != nil {
		return nil, err
	}

	return docs, nil
}
