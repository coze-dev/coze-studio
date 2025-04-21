package canvas

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/emitter"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/llm"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/textprocessor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/variableassigner"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
)

func (s *Canvas) ToWorkflowSchema() (*schema.WorkflowSchema, error) {
	sc := &schema.WorkflowSchema{}

	nodeMap := make(map[string]*Node)

	for i, node := range s.Nodes {
		nodeMap[node.ID] = s.Nodes[i]
		for j, subNode := range node.Blocks {
			nodeMap[subNode.ID] = node.Blocks[j]
			subNode.parent = node
			if len(subNode.Blocks) > 0 {
				return nil, fmt.Errorf("nested inner-workflow is not supported")
			}

			if len(subNode.Edges) > 0 {
				return nil, fmt.Errorf("nodes in inner-workflow should not have edges info")
			}

			if subNode.Type == BlockTypeBotBreak || subNode.Type == BlockTypeBotContinue {
				sc.Connections = append(sc.Connections, &schema.Connection{
					FromNode: nodes.NodeKey(subNode.ID),
					ToNode:   nodes.NodeKey(subNode.parent.ID),
				})
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

	newConnections, err := normalizePorts(sc.Connections, nodeMap)
	if err != nil {
		return nil, err
	}
	sc.Connections = newConnections

	return sc, nil
}

func normalizePorts(connections []*schema.Connection, nodeMap map[string]*Node) (normalized []*schema.Connection, err error) {
	for i := range connections {
		conn := connections[i]
		if conn.FromPort == nil || len(*conn.FromPort) == 0 {
			normalized = append(normalized, conn)
			continue
		}

		if *conn.FromPort == "loop-function-inline-output" || *conn.FromPort == "loop-output" { // ignore this, we don't need this for inner workflow to work
			normalized = append(normalized, conn)
			continue
		}

		node, ok := nodeMap[string(conn.FromNode)]
		if !ok {
			return nil, fmt.Errorf("node %s not found in node map", conn.FromNode)
		}

		var newPort string
		switch node.Type {
		case BlockTypeCondition:
			if *conn.FromPort == "true" {
				newPort = fmt.Sprintf(schema.BranchFmt, 0)
			} else if *conn.FromPort == "false" {
				newPort = schema.DefaultBranch
			} else if strings.HasPrefix(*conn.FromPort, "true_") {
				portN := strings.TrimPrefix(*conn.FromPort, "true_")
				n, err := strconv.Atoi(portN)
				if err != nil {
					return nil, fmt.Errorf("invalid port name: %s", *conn.FromPort)
				}
				newPort = fmt.Sprintf(schema.BranchFmt, n)
			}
		case BlockTypeBotIntent:
			newPort = *conn.FromPort
		case BlockTypeQuestion:
			// TODO: implement this
		default:
			return nil, fmt.Errorf("node type %s should not have ports", node.Type)
		}

		normalized = append(normalized, &schema.Connection{
			FromNode:   conn.FromNode,
			ToNode:     conn.ToNode,
			FromPort:   &newPort,
			FromBranch: true,
		})
	}

	return normalized, nil
}

type toNodeSchema struct {
	f          func(n *Node) (*schema.NodeSchema, error)
	compositeF func(n *Node) ([]*schema.NodeSchema, map[nodes.NodeKey]nodes.NodeKey, error)
	skip       bool
}

var blockTypeToNodeSchema = map[BlockType]func(*Node) (*schema.NodeSchema, error){
	BlockTypeBotStart:           toEntryNodeSchema,
	BlockTypeBotEnd:             toExitNodeSchema,
	BlockTypeBotLLM:             toLLMNodeSchema,
	BlockTypeBotLoopSetVariable: toLoopSetVariableNodeSchema,
	BlockTypeBotBreak:           toBreakNodeSchema,
	BlockTypeBotContinue:        toContinueNodeSchema,
	BlockTypeCondition:          toSelectorNodeSchema,
	BlockTypeBotText:            toTextProcessorNodeSchema,
	BlockTypeBotIntent:          toIntentDetectorSchema,
	BlockTypeDatabase:           toDatabaseCustomSQLSchema,
}

var blockTypeToCompositeNodeSchema = map[BlockType]func(*Node) ([]*schema.NodeSchema, map[nodes.NodeKey]nodes.NodeKey, error){
	BlockTypeBotLoop: toLoopNodeSchema,
}

var blockTypeToSkip = map[BlockType]bool{
	BlockTypeBotComment: true,
}

func (n *Node) ToNodeSchema() ([]*schema.NodeSchema, map[nodes.NodeKey]nodes.NodeKey, error) {
	cfg, ok := blockTypeToNodeSchema[n.Type]
	if ok {
		ns, err := cfg(n)
		if err != nil {
			return nil, nil, err
		}

		return []*schema.NodeSchema{ns}, nil, nil
	}

	_, ok = blockTypeToSkip[n.Type]
	if ok {
		return nil, nil, nil
	}

	commpositF, ok := blockTypeToCompositeNodeSchema[n.Type]
	if ok {
		return commpositF(n)
	}

	return nil, nil, fmt.Errorf("unsupported block type: %v", n.Type)
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
	if n.parent != nil {
		return nil, fmt.Errorf("entry node cannot have parent: %s", n.parent.ID)
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
	if n.parent != nil {
		return nil, fmt.Errorf("exit node cannot have parent: %s", n.parent.ID)
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

	param := n.Data.Inputs.LLMParam
	if param == nil {
		return nil, fmt.Errorf("llm node's llmParam is nil")
	}

	bs, _ := sonic.Marshal(param)
	llmParam := make(LLMParam, 0)
	if err := sonic.Unmarshal(bs, &llmParam); err != nil {
		return nil, err
	}
	convertedLLMParam, err := llmParamsToLLMParam(llmParam)
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
	if n.parent == nil {
		return nil, fmt.Errorf("loop set variable node must have parent: %s", n.ID)
	}

	ns := &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeVariableAssigner,
	}

	var pairs []*variableassigner.Pair
	for i, param := range n.Data.Inputs.InputParameters {
		if param.Left == nil || param.Right == nil {
			return nil, fmt.Errorf("loop set variable node's param left or right is nil")
		}

		leftSources, err := param.Left.ToFieldInfo(compose.FieldPath{fmt.Sprintf("left_%d", i)}, n.parent)
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

		if leftSources[0].Source.Ref.VariableType == nil || *leftSources[0].Source.Ref.VariableType != variable.ParentIntermediate {
			return nil, fmt.Errorf("loop set variable node's param left's ref's variable type is not variable.ParentIntermediate")
		}

		rightSources, err := param.Right.ToFieldInfo(compose.FieldPath{fmt.Sprintf("right_%d", i)}, n.parent)
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

func toSelectorNodeSchema(n *Node) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeSelector,
	}

	clauses := make([]*selector.OneClauseSchema, 0)
	for i, branchCond := range n.Data.Inputs.Branches {
		inputType := &nodes.TypeInfo{
			Type:       nodes.DataTypeObject,
			Properties: map[string]*nodes.TypeInfo{},
		}

		if len(branchCond.Condition.Conditions) == 1 { // single condition
			cond := branchCond.Condition.Conditions[0]
			op, err := cond.Operator.toSelectorOperator()
			if err != nil {
				return nil, err
			}

			left := cond.Left
			if left == nil {
				return nil, fmt.Errorf("operator left is nil")
			}

			leftType, err := left.Input.ToTypeInfo()
			if err != nil {
				return nil, err
			}

			leftSources, err := left.Input.ToFieldInfo(compose.FieldPath{fmt.Sprintf("%d", i), "Left"}, n.parent)
			if err != nil {
				return nil, err
			}

			inputType.Properties["left"] = leftType

			ns.AddInputSource(leftSources...)

			if cond.Right != nil {
				rightType, err := cond.Right.Input.ToTypeInfo()
				if err != nil {
					return nil, err
				}

				rightSources, err := cond.Right.Input.ToFieldInfo(compose.FieldPath{fmt.Sprintf("%d", i), "Right"}, n.parent)
				if err != nil {
					return nil, err
				}

				inputType.Properties["right"] = rightType
				ns.AddInputSource(rightSources...)
			}

			ns.SetInputType(fmt.Sprintf("%d", i), inputType)

			clauses = append(clauses, &selector.OneClauseSchema{
				Single: &op,
			})

			continue
		}

		var relation selector.ClauseRelation
		logic := branchCond.Condition.Logic
		if logic == OR {
			relation = selector.ClauseRelationOR
		} else if logic == AND {
			relation = selector.ClauseRelationAND
		}

		var ops []*selector.Operator
		for j, cond := range branchCond.Condition.Conditions {
			op, err := cond.Operator.toSelectorOperator()
			if err != nil {
				return nil, err
			}
			ops = append(ops, &op)

			left := cond.Left
			if left == nil {
				return nil, fmt.Errorf("operator left is nil")
			}

			leftType, err := left.Input.ToTypeInfo()
			if err != nil {
				return nil, err
			}

			leftSources, err := left.Input.ToFieldInfo(compose.FieldPath{fmt.Sprintf("%d", i), fmt.Sprintf("%d", j), "Left"}, n.parent)
			if err != nil {
				return nil, err
			}

			inputType.Properties[fmt.Sprintf("%d", j)] = &nodes.TypeInfo{
				Type: nodes.DataTypeObject,
				Properties: map[string]*nodes.TypeInfo{
					"left": leftType,
				},
			}

			ns.AddInputSource(leftSources...)

			if cond.Right != nil {
				rightType, err := cond.Right.Input.ToTypeInfo()
				if err != nil {
					return nil, err
				}

				rightSources, err := cond.Right.Input.ToFieldInfo(compose.FieldPath{fmt.Sprintf("%d", i), fmt.Sprintf("%d", j), "Right"}, n.parent)
				if err != nil {
					return nil, err
				}

				inputType.Properties[fmt.Sprintf("%d", j)].Properties["right"] = rightType
				ns.AddInputSource(rightSources...)
			}
		}

		ns.SetInputType(fmt.Sprintf("%d", i), inputType)

		clauses = append(clauses, &selector.OneClauseSchema{
			Multi: &selector.MultiClauseSchema{
				Clauses:  ops,
				Relation: relation,
			},
		})
	}

	ns.Configs = clauses
	return ns, nil
}

func toTextProcessorNodeSchema(n *Node) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeTextProcessor,
	}

	configs := make(map[string]any)

	if n.Data.Inputs.Method == Concat {
		configs["Type"] = textprocessor.ConcatText
		params := n.Data.Inputs.ConcatParams
		for _, param := range params {
			if param.Name == "concatResult" {
				configs["Tpl"] = param.Input.Value.Content.(string)
			} else if param.Name == "arrayItemConcatChar" {
				configs["ConcatChar"] = param.Input.Value.Content.(string)
			}
		}
	} else if n.Data.Inputs.Method == Split {
		configs["Type"] = textprocessor.SplitText
		params := n.Data.Inputs.SplitParams
		for _, param := range params {
			if param.Name == "delimiters" {
				delimiters := param.Input.Value.Content.([]any)
				first := delimiters[0].(string) // TODO: support multiple delimiters
				configs["Separator"] = first
			}
		}
	} else {
		return nil, fmt.Errorf("not supported method: %s", n.Data.Inputs.Method)
	}

	ns.Configs = configs

	if err := n.setInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err := n.setOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toLoopNodeSchema(n *Node) ([]*schema.NodeSchema, map[nodes.NodeKey]nodes.NodeKey, error) {

	if n.parent != nil {
		return nil, nil, fmt.Errorf("loop node cannot have parent: %s", n.parent.ID)
	}

	ns := &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeLoop,
	}

	var (
		allNS     []*schema.NodeSchema
		hierarchy = make(map[nodes.NodeKey]nodes.NodeKey)
	)

	for _, childN := range n.Blocks {
		if _, ok := blockTypeToSkip[childN.Type]; ok {
			continue
		}

		f, ok := blockTypeToNodeSchema[childN.Type]
		if !ok {
			return nil, nil, fmt.Errorf("unknown node type: %s", childN.Type)
		}

		childNS, err := f(childN)
		if err != nil {
			return nil, nil, err
		}

		allNS = append(allNS, childNS)
		hierarchy[nodes.NodeKey(childN.ID)] = nodes.NodeKey(n.ID)
	}

	loopType, err := n.Data.Inputs.LoopType.toLoopType()
	if err != nil {
		return nil, nil, err
	}
	ns.SetConfigKV("LoopType", loopType)

	intermediateVars := make(map[string]*nodes.TypeInfo)
	for _, param := range n.Data.Inputs.VariableParameters {
		tInfo, err := param.Input.ToTypeInfo()
		if err != nil {
			return nil, nil, err
		}
		intermediateVars[param.Name] = tInfo

		ns.SetInputType(param.Name, tInfo)
		sources, err := param.Input.ToFieldInfo(compose.FieldPath{param.Name}, nil)
		if err != nil {
			return nil, nil, err
		}
		ns.AddInputSource(sources...)
	}
	ns.SetConfigKV("IntermediateVars", intermediateVars)

	if err := n.setInputsForNodeSchema(ns); err != nil {
		return nil, nil, err
	}

	if err := n.setOutputsForNodeSchema(ns); err != nil {
		return nil, nil, err
	}

	loopCount := n.Data.Inputs.LoopCount
	if loopCount != nil {
		typeInfo, err := loopCount.ToTypeInfo()
		if err != nil {
			return nil, nil, err
		}
		ns.SetInputType(loop.Count, typeInfo)

		sources, err := loopCount.ToFieldInfo(compose.FieldPath{loop.Count}, nil)
		if err != nil {
			return nil, nil, err
		}
		ns.AddInputSource(sources...)
	}

	allNS = append(allNS, ns)

	return allNS, hierarchy, nil
}

func toIntentDetectorSchema(n *Node) (*schema.NodeSchema, error) {

	ns := &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeIntentDetector,
	}

	param := n.Data.Inputs.LLMParam
	if param == nil {
		return nil, fmt.Errorf("intent detector node's llmParam is nil")
	}

	llmParam, ok := param.(IntentDetectorLLMParam)
	if !ok {
		return nil, fmt.Errorf("llm node's llmParam must be LLMParam, got %v", llmParam)
	}
	convertedLLMParam, err := intentDetectorParamsToLLMParam(llmParam)
	if err != nil {
		return nil, err
	}

	ns.SetConfigKV("LLMParams", convertedLLMParam)
	ns.SetConfigKV("SystemPrompt", convertedLLMParam.SystemPrompt)

	var intents = make([]string, 0, len(n.Data.Inputs.Intents))
	for _, it := range n.Data.Inputs.Intents {
		intents = append(intents, it.Name)
	}
	ns.SetConfigKV("Intents", intents)

	if n.Data.Inputs.Mode == "top_speed" {
		ns.SetConfigKV("IsFastMode", true)
	}

	if err = n.setInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.setOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toDatabaseCustomSQLSchema(n *Node) (*schema.NodeSchema, error) {

	ns := &schema.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: schema.NodeTypeDatabaseCustomSQL,
	}

	dsList := n.Data.Inputs.DatabaseInfoList
	if len(dsList) == 0 {
		return nil, fmt.Errorf("database info is requird")
	}
	databaseInfo := dsList[0]

	dsID, err := strconv.ParseInt(databaseInfo.DatabaseInfoID, 10, 64)
	if err != nil {
		return nil, err
	}
	ns.SetConfigKV("DatabaseInfoID", dsID)

	sql := n.Data.Inputs.SQL
	if len(sql) == 0 {
		return nil, fmt.Errorf("sql is requird")
	}

	ns.SetConfigKV("SQLTemplate", sql)

	if err = n.setInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.setOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}
