package intentdetector

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/components/model"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type Config struct {
	Intents              []string        `json:"intents"`
	SystemPromptTemplate string          `json:"system_prompt_template"`
	IsFastMode           bool            `json:"is_fast_mode"`
	ChatModel            model.ChatModel `json:"model_config"`
}

const SystemIntentPrompt = `
# Role
You are an intention classification expert, good at being able to judge which classification the user's input belongs to.

## Skills
Skill 1: Clearly determine which of the following intention classifications the user's input belongs to.
Intention classification list:
[
{"classificationId": 0, "content": "Other intentions"},
{{intents}}
]

Note:
- Please determine the match only between the user's input content and the Intention classification list content, without judging or categorizing the match with the classification ID.

{{advance}}

## Reply requirements
- The answer must be returned in JSON format.
- Strictly ensure that the output is in a valid JSON format.
- Do not add prefix "json or suffix""
- The answer needs to include the following fields such as:
{
"classificationId": 0,
"reason": "Unclear intentions"
}

##Limit
- Please do not reply in text.
`

const FastModeSystemIntentPrompt = `
# Role
You are an intention classification expert, good at  being able to judge which classification the user's input belongs to.

## Skills
Skill 1: Clearly determine which of the following intention classifications the user's input belongs to.
Intention classification list:
[
{"classificationId": 0, "content": "Other intentions"},
{{intents}}
]

Note:
- Please determine the match only between the user's input content and the Intention classification list content, without judging or categorizing the match with the classification ID.


## Reply requirements
- The answer must be a number indicated classificationId.
- if not match, please just output an number 0.
- do not output json format data, just output an number.

##Limit
- Please do not reply in text.`

type IntentDetector struct {
	config *Config
}

func defaultFastModeChatModel() model.ChatModel {
	return nil
}

func NewIntentDetector(_ context.Context, cfg *Config) (*IntentDetector, error) {
	if cfg == nil {
		return nil, errors.New("cfg is required")
	}
	if !cfg.IsFastMode && cfg.ChatModel == nil {
		return nil, errors.New("config chat model is required")
	}

	if len(cfg.Intents) == 0 {
		return nil, errors.New("config intents is required")
	}

	return &IntentDetector{
		config: cfg,
	}, nil
}

func (id *IntentDetector) parseToNodeOut(content string) (map[string]any, error) {
	nodeOutput := make(map[string]any)
	nodeOutput["classificationId"] = 0
	if content == "" {
		return nodeOutput, errors.New("content is empty")
	}

	if id.config.IsFastMode {
		cid, err := strconv.ParseInt(content, 10, 64)
		if err != nil {
			return nodeOutput, err
		}
		nodeOutput["classificationId"] = cid
		return nodeOutput, nil
	}

	leftIndex := strings.Index(content, "{")
	rightIndex := strings.Index(content, "}")
	if leftIndex == -1 || rightIndex == -1 {
		return nodeOutput, errors.New("content is invalid")
	}

	err := json.Unmarshal([]byte(content[leftIndex:rightIndex+1]), &nodeOutput)
	if err != nil {
		return nodeOutput, err
	}

	return nodeOutput, nil
}

func (id *IntentDetector) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	query, ok := input["query"]
	if !ok {
		return nil, errors.New("input query field required")
	}

	var spt string

	if id.config.IsFastMode {
		spt = FastModeSystemIntentPrompt
	} else {
		ad, err := nodes.Jinja2TemplateRender(id.config.SystemPromptTemplate, map[string]any{"query": query})
		if err != nil {
			return nil, err
		}
		spt, err = nodes.Jinja2TemplateRender(SystemIntentPrompt, map[string]interface{}{"advance": ad})
		if err != nil {
			return nil, err
		}
	}

	prompts := prompt.FromMessages(schema.Jinja2,
		&schema.Message{Content: spt, Role: schema.System},
		&schema.Message{Content: query.(string), Role: schema.User})

	messages, err := prompts.Format(ctx, map[string]any{"intents": id.toIntentString(id.config.Intents)})
	if err != nil {
		return nil, err
	}

	o, err := id.config.ChatModel.Generate(ctx, messages)
	if err != nil {
		return nil, err
	}

	return id.parseToNodeOut(o.Content)
}

func (id *IntentDetector) toIntentString(its []string) string {
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
