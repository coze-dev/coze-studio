package canvas

import (
	"fmt"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/emitter"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/llm"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableassigner"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
)

func (s *Canvas) ToWorkflowSchema() (*schema.WorkflowSchema, error) {
	sc := &schema.WorkflowSchema{}

	for _, node := range s.Nodes {
		for _, subNode := range node.Blocks {
			subNode.parentID = node.ID
			if len(subNode.Blocks) > 0 {
				return nil, fmt.Errorf("nested inner-workflow is not supported")
			}

			if len(subNode.Edges) > 0 {
				return nil, fmt.Errorf("nodes in inner-workflow should not have edges info")
			}
		}

		nsList, hierarchy, err := node.ToNodeSchema()
		if err != nil {
			return nil, err
		}

		sc.Nodes = append(sc.Nodes, nsList...)
		if len(hierarchy) > 0 {
			if sc.Hierarchy == nil {
				sc.Hierarchy = make(map[nodes.NodeKey]nodes.NodeKey)
			}

			for k, v := range hierarchy {
				sc.Hierarchy[k] = v
			}
		}

		for _, edge := range node.Edges {
			sc.Connections = append(sc.Connections, edge.ToConnection())
		}
	}

	for _, edge := range s.Edges {
		sc.Connections = append(sc.Connections, edge.ToConnection())
	}

	return sc, nil
}

type toNodeSchema struct {
	f          func(n *Node) (*schema.NodeSchema, error)
	compositeF func(n *Node) ([]*schema.NodeSchema, map[nodes.NodeKey]nodes.NodeKey, error)
	skip       bool
}

var blockTypeToNodeSchema = map[BlockType]toNodeSchema{
	BlockTypeBotStart:           {f: toEntryNodeSchema},
	BlockTypeBotEnd:             {f: toExitNodeSchema},
	BlockTypeBotLLM:             {f: toLLMNodeSchema},
	BlockTypeBotComment:         {skip: true},
	BlockTypeBotLoopSetVariable: {f: toLoopSetVariableNodeSchema},
	BlockTypeBotBreak:           {f: toBreakNodeSchema},
	BlockTypeBotContinue:        {f: toContinueNodeSchema},
}

func (n *Node) ToNodeSchema() ([]*schema.NodeSchema, map[nodes.NodeKey]nodes.NodeKey, error) {
	cfg, ok := blockTypeToNodeSchema[n.Type]
	if !ok {
		return nil, nil, fmt.Errorf("unknown node type: %s", n.Type)
	}

	if cfg.skip {
		return nil, nil, nil
	}

	if cfg.compositeF != nil {
		return cfg.compositeF(n)
	}

	ns, err := cfg.f(n)
	if err != nil {
		return nil, nil, err
	}

	return []*schema.NodeSchema{ns}, nil, nil
}

func (e *Edge) ToConnection() *schema.Connection {
	conn := &schema.Connection{
		FromNode: nodes.NodeKey(e.SourceNodeID),
		ToNode:   nodes.NodeKey(e.TargetNodeID),
	}

	if len(e.SourceNodeID) > 0 {
		conn.FromPort = &e.SourcePortID
	}

	return conn
}

func toEntryNodeSchema(n *Node) (*schema.NodeSchema, error) {
	if len(n.parentID) > 0 {
		return nil, fmt.Errorf("entry node cannot have parent: %s", n.parentID)
	}

	if n.ID != schema.EntryNodeKey {
		return nil, fmt.Errorf("entry node id must be %s, got %s", schema.EntryNodeKey, n.ID)
	}

	ns := &schema.NodeSchema{
		Key:  schema.EntryNodeKey,
		Type: schema.NodeTypeEntry,
	}

	if err := n.setOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toExitNodeSchema(n *Node) (*schema.NodeSchema, error) {
	if len(n.parentID) > 0 {
		return nil, fmt.Errorf("exit node cannot have parent: %s", n.parentID)
	}

	if n.ID != schema.ExitNodeKey {
		return nil, fmt.Errorf("exit node id must be %s, got %s", schema.ExitNodeKey, n.ID)
	}

	ns := &schema.NodeSchema{
		Key:  schema.ExitNodeKey,
		Type: schema.NodeTypeExit,
	}

	content := n.Data.Inputs.Content
	streamingOutput := n.Data.Inputs.StreamingOutput

	if streamingOutput {
		ns.SetConfigKV("Mode", emitter.Streaming)
	} else {
		ns.SetConfigKV("Mode", emitter.NonStreaming)
	}

	if content != nil {
		if content.Type != VariableTypeString {
			return nil, fmt.Errorf("exit node's content type must be %s, got %s", VariableTypeString, content.Type)
		}

		if content.Value.Type != BlockInputValueTypeLiteral {
			return nil, fmt.Errorf("exit node's content value type must be %s, got %s", BlockInputValueTypeLiteral, content.Value.Type)
		}

		template, ok := content.Value.Content.(string)
		if !ok {
			return nil, fmt.Errorf("exit node's content value must be string, got %v", content.Value.Content)
		}

		ns.SetConfigKV("Template", template)
	}

	if err := n.setInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toLLMNodeSchema(n *Node) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeLLM,
	}

	llmParam := n.Data.Inputs.LLMParam
	if llmParam == nil {
		return nil, fmt.Errorf("llm node's llmParam is nil")
	}

	convertedLLMParam, err := paramsToLLMParam(llmParam)
	if err != nil {
		return nil, err
	}

	ns.SetConfigKV("LLMParams", convertedLLMParam)
	ns.SetConfigKV("SystemPrompt", convertedLLMParam.SystemPrompt)
	ns.SetConfigKV("UserPrompt", convertedLLMParam.Prompt)

	var resFormat llm.Format
	switch convertedLLMParam.ResponseFormat {
	case model.ResponseFormat_Text:
		resFormat = llm.FormatText
	case model.ResponseFormat_Markdown:
		resFormat = llm.FormatMarkdown
	case model.ResponseFormat_JSON:
		resFormat = llm.FormatJSON
	default:
		return nil, fmt.Errorf("unsupported response format: %d", convertedLLMParam.ResponseFormat)
	}

	ns.SetConfigKV("OutputFormat", resFormat)
	ns.SetConfigKV("IgnoreException", n.Data.Inputs.SettingOnError.Switch)
	if n.Data.Inputs.SettingOnError.Switch {
		defaultOut := make(map[string]any)
		err = sonic.UnmarshalString(n.Data.Inputs.SettingOnError.DataOnErr, &defaultOut)
		if err != nil {
			return nil, err
		}
		ns.SetConfigKV("DefaultOutput", defaultOut)
	}

	if err = n.setOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toLoopSetVariableNodeSchema(n *Node) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeVariableAssigner,
	}

	var pairs []*variableassigner.Pair
	for i, param := range n.Data.Inputs.InputParameters {
		if param.Left == nil || param.Right == nil {
			return nil, fmt.Errorf("loop set variable node's param left or right is nil")
		}

		leftSources, err := param.Left.ToInputSource(compose.FieldPath{fmt.Sprintf("left_%d", i)}, n.parentID)
		if err != nil {
			return nil, err
		}

		ns.AddInputSource(leftSources...)

		if len(leftSources) != 1 {
			return nil, fmt.Errorf("loop set variable node's param left is not a single source")
		}

		if leftSources[0].Source.Ref == nil {
			return nil, fmt.Errorf("loop set variable node's param left's ref is nil")
		}

		if leftSources[0].Source.Ref.VariableType == nil || *leftSources[0].Source.Ref.VariableType == variable.ParentIntermediate {
			return nil, fmt.Errorf("loop set variable node's param left's ref's variable type is not variable.ParentIntermediate")
		}

		rightSources, err := param.Right.ToInputSource(compose.FieldPath{fmt.Sprintf("right_%d", i)}, n.parentID)
		if err != nil {
			return nil, err
		}

		ns.AddInputSource(rightSources...)

		if len(rightSources) != 1 {
			return nil, fmt.Errorf("loop set variable node's param right is not a single source")
		}

		pair := &variableassigner.Pair{
			Left:  *leftSources[0].Source.Ref,
			Right: rightSources[0].Path,
		}

		pairs = append(pairs, pair)
	}

	ns.Configs = pairs

	return ns, nil
}

func toBreakNodeSchema(n *Node) (*schema.NodeSchema, error) {
	return &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeBreak,
	}, nil
}

func toContinueNodeSchema(n *Node) (*schema.NodeSchema, error) {
	return &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeContinue,
	}, nil
}
