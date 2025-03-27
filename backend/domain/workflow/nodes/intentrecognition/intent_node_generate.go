package intentrecognition

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"code.byted.org/flow/opencoze/backend/infra/impl/model"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"
	"github.com/nikolalohinski/gonja"
)

type Lambada func(ctx context.Context, in map[string]any) (*NodeOutput, error)

type IntentGenerateNode struct {
	rz     IntentRecognizer
	config *Config
}

func NewIntentGenerateNode(ctx context.Context, cfg *Config) (*IntentGenerateNode, error) {

	if cfg == nil {
		return nil, errors.New("cfg cannot be nil")
	}

	factory, err := model.NewDefaultFactory()
	if err != nil {
		return nil, err
	}

	cm, err := factory.CreateChatModel(ctx, cfg.ModelConfig.Protocol, cfg.ModelConfig.ModelConfig)
	if err != nil {
		return nil, err
	}

	rz, err := NewChatModelRecognize(ctx, cm)
	if err != nil {
		return nil, err
	}

	return &IntentGenerateNode{rz: rz, config: cfg}, nil
}

func (ig *IntentGenerateNode) parseToNodeOut(content string, topSeed bool) *NodeOutput {
	nodeO := &NodeOutput{ClassificationID: 0}
	if content == "" {
		return nodeO
	}

	if topSeed {
		cid, err := strconv.ParseInt(content, 10, 64)
		if err != nil {
			return nodeO
		}
		nodeO.ClassificationID = cid
		return nodeO
	}

	leftIndex := strings.Index(content, "{")
	rightIndex := strings.Index(content, "}")
	if leftIndex == -1 || rightIndex == -1 {
		return nodeO
	}

	err := json.Unmarshal([]byte(content[leftIndex:rightIndex+1]), nodeO)
	if err != nil {
		return nodeO
	}

	return nodeO

}

func (ig *IntentGenerateNode) GenerateLambada(ctx context.Context) (Lambada, error) {
	return func(ctx context.Context, input map[string]any) (*NodeOutput, error) {
		query, ok := input["query"]
		if !ok {
			return nil, fmt.Errorf("no query found in input")
		}

		spt, ad, err := ig.getPrompts(ctx, query)
		if err != nil {
			return nil, err
		}

		prompts := prompt.FromMessages(schema.Jinja2,
			&schema.Message{Content: spt, Role: schema.System},
			&schema.Message{Content: "{{user_query}}", Role: schema.User})

		messages, err := prompts.Format(ctx, map[string]any{"intents": ig.toIntentString(ig.config.Intents), "advance": ad, "user_query": query})
		if err != nil {
			return nil, err
		}
		o, err := ig.rz.Recognize(ctx, messages...)
		if err != nil {
			return nil, err
		}
		return ig.parseToNodeOut(o.Content, ig.config.TopSeed), nil
	}, nil
}

func (ig *IntentGenerateNode) getPrompts(_ context.Context, query any) (systemPrompt string, advancePrompt string, err error) {

	if ig.config.TopSeed {
		systemPrompt = TopSeedSystemIntentPrompt
		advancePrompt = TopSpeedAdvance
	} else {
		systemPrompt = SystemIntentPrompt
		advancePrompt, err = jinja2TemplateRender(ig.config.SystemPrompt, map[string]any{"query": query}) // must query
		if err != nil {
			return "", "", err
		}
	}

	return systemPrompt, advancePrompt, nil
}

func jinja2TemplateRender(template string, vals map[string]interface{}) (string, error) {
	tpl, err := gonja.FromString(template)
	if err != nil {
		return "", err
	}
	return tpl.Execute(vals)
}

func (ig *IntentGenerateNode) toIntentString(its []string) string {
	type IntentVariableItem struct {
		ClassificationID int64  `json:"classificationId"`
		Content          string `json:"content"`
	}

	vs := make([]*IntentVariableItem, 0, len(its))

	for idx, it := range its {
		vs = append(vs, &IntentVariableItem{
			ClassificationID: int64(idx + 1),
			Content:          it,
		})
	}
	itsBytes, _ := json.Marshal(vs)
	return string(itsBytes)
}
