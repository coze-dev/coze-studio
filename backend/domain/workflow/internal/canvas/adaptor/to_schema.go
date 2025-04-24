package adaptor

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/bytedance/sonic"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/spf13/cast"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/httprequester"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/llm"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/selector"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/textprocessor"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/variableassigner"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo"
)

var repoSingleton repo.Repository

func getRepo() repo.Repository {
	return repoSingleton
}

func CanvasToWorkflowSchema(ctx context.Context, s *canvas.Canvas) (*compose.WorkflowSchema, error) {
	sc := &compose.WorkflowSchema{}

	nodeMap := make(map[string]*canvas.Node)

	for i, node := range s.Nodes {
		nodeMap[node.ID] = s.Nodes[i]
		for j, subNode := range node.Blocks {
			nodeMap[subNode.ID] = node.Blocks[j]
			subNode.SetParent(node)
			if len(subNode.Blocks) > 0 {
				return nil, fmt.Errorf("nested inner-workflow is not supported")
			}

			if len(subNode.Edges) > 0 {
				return nil, fmt.Errorf("nodes in inner-workflow should not have edges info")
			}

			if subNode.Type == canvas.BlockTypeBotBreak || subNode.Type == canvas.BlockTypeBotContinue {
				sc.Connections = append(sc.Connections, &compose.Connection{
					FromNode: nodes.NodeKey(subNode.ID),
					ToNode:   nodes.NodeKey(subNode.Parent().ID),
				})
			}
		}

		if node.Type == canvas.BlockTypeBotSubWorkflow {
			subCanvas, err := getRepo().GetSubWorkflowCanvas(ctx, node)
			if err != nil {
				return nil, err
			}
			subWorkflowSC, err := CanvasToWorkflowSchema(ctx, subCanvas)
			if err != nil {
				return nil, err
			}
			ns, err := toSubWorkflowNodeSchema(node, subWorkflowSC)
			if err != nil {
				return nil, err
			}
			sc.Nodes = append(sc.Nodes, ns)
			continue
		}

		nsList, hierarchy, err := NodeToNodeSchema(node)
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
			sc.Connections = append(sc.Connections, EdgeToConnection(edge))
		}
	}

	for _, edge := range s.Edges {
		sc.Connections = append(sc.Connections, EdgeToConnection(edge))
	}

	newConnections, err := normalizePorts(sc.Connections, nodeMap)
	if err != nil {
		return nil, err
	}
	sc.Connections = newConnections

	return sc, nil
}

func normalizePorts(connections []*compose.Connection, nodeMap map[string]*canvas.Node) (normalized []*compose.Connection, err error) {
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
		case canvas.BlockTypeCondition:
			if *conn.FromPort == "true" {
				newPort = fmt.Sprintf(compose.BranchFmt, 0)
			} else if *conn.FromPort == "false" {
				newPort = compose.DefaultBranch
			} else if strings.HasPrefix(*conn.FromPort, "true_") {
				portN := strings.TrimPrefix(*conn.FromPort, "true_")
				n, err := strconv.Atoi(portN)
				if err != nil {
					return nil, fmt.Errorf("invalid port name: %s", *conn.FromPort)
				}
				newPort = fmt.Sprintf(compose.BranchFmt, n)
			}
		case canvas.BlockTypeBotIntent:
			newPort = *conn.FromPort
		case canvas.BlockTypeQuestion:
			// TODO: implement this
		default:
			return nil, fmt.Errorf("node type %s should not have ports", node.Type)
		}

		normalized = append(normalized, &compose.Connection{
			FromNode:   conn.FromNode,
			ToNode:     conn.ToNode,
			FromPort:   &newPort,
			FromBranch: true,
		})
	}

	return normalized, nil
}

var blockTypeToNodeSchema = map[canvas.BlockType]func(*canvas.Node) (*compose.NodeSchema, error){
	canvas.BlockTypeBotStart:           toEntryNodeSchema,
	canvas.BlockTypeBotEnd:             toExitNodeSchema,
	canvas.BlockTypeBotLLM:             toLLMNodeSchema,
	canvas.BlockTypeBotLoopSetVariable: toLoopSetVariableNodeSchema,
	canvas.BlockTypeBotBreak:           toBreakNodeSchema,
	canvas.BlockTypeBotContinue:        toContinueNodeSchema,
	canvas.BlockTypeCondition:          toSelectorNodeSchema,
	canvas.BlockTypeBotText:            toTextProcessorNodeSchema,
	canvas.BlockTypeBotIntent:          toIntentDetectorSchema,
	canvas.BlockTypeDatabase:           toDatabaseCustomSQLSchema,
	canvas.BlockTypeDatabaseSelect:     toDatabaseQuerySchema,
	canvas.BlockTypeDatabaseInsert:     toDatabaseInsertSchema,
	canvas.BlockTypeDatabaseDelete:     toDatabaseDeleteSchema,
	canvas.BlockTypeDatabaseUpdate:     toDatabaseUpdateSchema,
	canvas.BlockTypeBotHttp:            toHttpRequesterSchema,
	canvas.BlockTypeBotDatasetWrite:    toKnowledgeIndexerSchema,
	canvas.BlockTypeBotDataset:         toKnowledgeRetrieverSchema,
	canvas.BlockTypeBotAssignVariable:  toVariableAssignerSchema,
}

var blockTypeToCompositeNodeSchema = map[canvas.BlockType]func(*canvas.Node) ([]*compose.NodeSchema, map[nodes.NodeKey]nodes.NodeKey, error){
	canvas.BlockTypeBotLoop: toLoopNodeSchema,
}

var blockTypeToSkip = map[canvas.BlockType]bool{
	canvas.BlockTypeBotComment: true,
}

func NodeToNodeSchema(n *canvas.Node) ([]*compose.NodeSchema, map[nodes.NodeKey]nodes.NodeKey, error) {
	cfg, ok := blockTypeToNodeSchema[n.Type]
	if ok {
		ns, err := cfg(n)
		if err != nil {
			return nil, nil, err
		}

		return []*compose.NodeSchema{ns}, nil, nil
	}

	_, ok = blockTypeToSkip[n.Type]
	if ok {
		return nil, nil, nil
	}

	compositeF, ok := blockTypeToCompositeNodeSchema[n.Type]
	if ok {
		return compositeF(n)
	}

	return nil, nil, fmt.Errorf("unsupported block type: %v", n.Type)
}

func EdgeToConnection(e *canvas.Edge) *compose.Connection {
	conn := &compose.Connection{
		FromNode: nodes.NodeKey(e.SourceNodeID),
		ToNode:   nodes.NodeKey(e.TargetNodeID),
	}

	if len(e.SourceNodeID) > 0 {
		conn.FromPort = &e.SourcePortID
	}

	return conn
}

func toEntryNodeSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	if n.Parent() != nil {
		return nil, fmt.Errorf("entry node cannot have parent: %s", n.Parent().ID)
	}

	if n.ID != compose.EntryNodeKey {
		return nil, fmt.Errorf("entry node id must be %s, got %s", compose.EntryNodeKey, n.ID)
	}

	ns := &compose.NodeSchema{
		Key:  compose.EntryNodeKey,
		Type: nodes.NodeTypeEntry,
		Name: n.Data.Meta.Title,
	}

	if err := n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toExitNodeSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	if n.Parent() != nil {
		return nil, fmt.Errorf("exit node cannot have parent: %s", n.Parent().ID)
	}

	if n.ID != compose.ExitNodeKey {
		return nil, fmt.Errorf("exit node id must be %s, got %s", compose.ExitNodeKey, n.ID)
	}

	ns := &compose.NodeSchema{
		Key:  compose.ExitNodeKey,
		Type: nodes.NodeTypeExit,
		Name: n.Data.Meta.Title,
	}

	content := n.Data.Inputs.Content
	streamingOutput := n.Data.Inputs.StreamingOutput

	if streamingOutput {
		ns.SetConfigKV("Mode", nodes.Streaming)
	} else {
		ns.SetConfigKV("Mode", nodes.NonStreaming)
	}

	if content != nil {
		if content.Type != canvas.VariableTypeString {
			return nil, fmt.Errorf("exit node's content type must be %s, got %s", canvas.VariableTypeString, content.Type)
		}

		if content.Value.Type != canvas.BlockInputValueTypeLiteral {
			return nil, fmt.Errorf("exit node's content value type must be %s, got %s", canvas.BlockInputValueTypeLiteral, content.Value.Type)
		}

		template, ok := content.Value.Content.(string)
		if !ok {
			return nil, fmt.Errorf("exit node's content value must be string, got %v", content.Value.Content)
		}

		ns.SetConfigKV("Template", template)
	}

	if err := n.SetInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toLLMNodeSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeLLM,
		Name: n.Data.Meta.Title,
	}

	param := n.Data.Inputs.LLMParam
	if param == nil {
		return nil, fmt.Errorf("llm node's llmParam is nil")
	}

	bs, _ := sonic.Marshal(param)
	llmParam := make(canvas.LLMParam, 0)
	if err := sonic.Unmarshal(bs, &llmParam); err != nil {
		return nil, err
	}
	convertedLLMParam, err := canvas.LLMParamsToLLMParam(llmParam)
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

	if err = n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toLoopSetVariableNodeSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	if n.Parent() == nil {
		return nil, fmt.Errorf("loop set variable node must have parent: %s", n.ID)
	}

	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeVariableAssigner,
		Name: n.Data.Meta.Title,
	}

	var pairs []*variableassigner.Pair
	for i, param := range n.Data.Inputs.InputParameters {
		if param.Left == nil || param.Right == nil {
			return nil, fmt.Errorf("loop set variable node's param left or right is nil")
		}

		leftSources, err := param.Left.ToFieldInfo(einoCompose.FieldPath{fmt.Sprintf("left_%d", i)}, n.Parent())
		if err != nil {
			return nil, err
		}

		if len(leftSources) != 1 {
			return nil, fmt.Errorf("loop set variable node's param left is not a single source")
		}

		if leftSources[0].Source.Ref == nil {
			return nil, fmt.Errorf("loop set variable node's param left's ref is nil")
		}

		if leftSources[0].Source.Ref.VariableType == nil || *leftSources[0].Source.Ref.VariableType != variable.ParentIntermediate {
			return nil, fmt.Errorf("loop set variable node's param left's ref's variable type is not variable.ParentIntermediate")
		}

		rightSources, err := param.Right.ToFieldInfo(einoCompose.FieldPath{fmt.Sprintf("right_%d", i)}, n.Parent())
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

func toBreakNodeSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	return &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeBreak,
		Name: n.Data.Meta.Title,
	}, nil
}

func toContinueNodeSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	return &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeContinue,
		Name: n.Data.Meta.Title,
	}, nil
}

func toSelectorNodeSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeSelector,
		Name: n.Data.Meta.Title,
	}

	clauses := make([]*selector.OneClauseSchema, 0)
	for i, branchCond := range n.Data.Inputs.Branches {
		inputType := &nodes.TypeInfo{
			Type:       nodes.DataTypeObject,
			Properties: map[string]*nodes.TypeInfo{},
		}

		if len(branchCond.Condition.Conditions) == 1 { // single condition
			cond := branchCond.Condition.Conditions[0]
			op, err := cond.Operator.ToSelectorOperator()
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

			leftSources, err := left.Input.ToFieldInfo(einoCompose.FieldPath{fmt.Sprintf("%d", i), selector.LeftKey}, n.Parent())
			if err != nil {
				return nil, err
			}

			inputType.Properties[selector.LeftKey] = leftType

			ns.AddInputSource(leftSources...)

			if cond.Right != nil {
				rightType, err := cond.Right.Input.ToTypeInfo()
				if err != nil {
					return nil, err
				}

				rightSources, err := cond.Right.Input.ToFieldInfo(einoCompose.FieldPath{fmt.Sprintf("%d", i), selector.RightKey}, n.Parent())
				if err != nil {
					return nil, err
				}

				inputType.Properties[selector.RightKey] = rightType
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
		if logic == canvas.OR {
			relation = selector.ClauseRelationOR
		} else if logic == canvas.AND {
			relation = selector.ClauseRelationAND
		}

		var ops []*selector.Operator
		for j, cond := range branchCond.Condition.Conditions {
			op, err := cond.Operator.ToSelectorOperator()
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

			leftSources, err := left.Input.ToFieldInfo(einoCompose.FieldPath{fmt.Sprintf("%d", i), fmt.Sprintf("%d", j), selector.LeftKey}, n.Parent())
			if err != nil {
				return nil, err
			}

			inputType.Properties[fmt.Sprintf("%d", j)] = &nodes.TypeInfo{
				Type: nodes.DataTypeObject,
				Properties: map[string]*nodes.TypeInfo{
					selector.LeftKey: leftType,
				},
			}

			ns.AddInputSource(leftSources...)

			if cond.Right != nil {
				rightType, err := cond.Right.Input.ToTypeInfo()
				if err != nil {
					return nil, err
				}

				rightSources, err := cond.Right.Input.ToFieldInfo(einoCompose.FieldPath{fmt.Sprintf("%d", i), fmt.Sprintf("%d", j), selector.RightKey}, n.Parent())
				if err != nil {
					return nil, err
				}

				inputType.Properties[fmt.Sprintf("%d", j)].Properties[selector.RightKey] = rightType
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

func toTextProcessorNodeSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeTextProcessor,
		Name: n.Data.Meta.Title,
	}

	configs := make(map[string]any)

	if n.Data.Inputs.Method == canvas.Concat {
		configs["Type"] = textprocessor.ConcatText
		params := n.Data.Inputs.ConcatParams
		for _, param := range params {
			if param.Name == "concatResult" {
				configs["Tpl"] = param.Input.Value.Content.(string)
			} else if param.Name == "arrayItemConcatChar" {
				configs["ConcatChar"] = param.Input.Value.Content.(string)
			}
		}
	} else if n.Data.Inputs.Method == canvas.Split {
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

	if err := n.SetInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err := n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toLoopNodeSchema(n *canvas.Node) ([]*compose.NodeSchema, map[nodes.NodeKey]nodes.NodeKey, error) {
	if n.Parent() != nil {
		return nil, nil, fmt.Errorf("loop node cannot have parent: %s", n.Parent().ID)
	}

	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeLoop,
		Name: n.Data.Meta.Title,
	}

	var (
		allNS     []*compose.NodeSchema
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

	loopType, err := n.Data.Inputs.LoopType.ToLoopType()
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
		sources, err := param.Input.ToFieldInfo(einoCompose.FieldPath{param.Name}, nil)
		if err != nil {
			return nil, nil, err
		}
		ns.AddInputSource(sources...)
	}
	ns.SetConfigKV("IntermediateVars", intermediateVars)

	if err := n.SetInputsForNodeSchema(ns); err != nil {
		return nil, nil, err
	}

	if err := n.SetOutputsForNodeSchema(ns); err != nil {
		return nil, nil, err
	}

	loopCount := n.Data.Inputs.LoopCount
	if loopCount != nil {
		typeInfo, err := loopCount.ToTypeInfo()
		if err != nil {
			return nil, nil, err
		}
		ns.SetInputType(loop.Count, typeInfo)

		sources, err := loopCount.ToFieldInfo(einoCompose.FieldPath{loop.Count}, nil)
		if err != nil {
			return nil, nil, err
		}
		ns.AddInputSource(sources...)
	}

	allNS = append(allNS, ns)

	return allNS, hierarchy, nil
}

func toSubWorkflowNodeSchema(n *canvas.Node, subWorkflowSC *compose.WorkflowSchema) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:               nodes.NodeKey(n.ID),
		Type:              nodes.NodeTypeSubWorkflow,
		Name:              n.Data.Meta.Title,
		SubWorkflowSchema: subWorkflowSC,
	}

	terminationType := n.Data.Inputs.TerminationType

	if terminationType == 0 {
		ns.SetConfigKV("Mode", nodes.NonStreaming)
	} else if terminationType == 1 {
		ns.SetConfigKV("Mode", nodes.Streaming)
	} else {
		return nil, fmt.Errorf("sub workflow node's terminationType is not supported: %d", terminationType)
	}

	if err := n.SetInputsForNodeSchema(ns); err != nil {
		return nil, err
	}
	if err := n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}
	return ns, nil
}

func toIntentDetectorSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeIntentDetector,
		Name: n.Data.Meta.Title,
	}

	param := n.Data.Inputs.LLMParam
	if param == nil {
		return nil, fmt.Errorf("intent detector node's llmParam is nil")
	}

	llmParam, ok := param.(canvas.IntentDetectorLLMParam)
	if !ok {
		return nil, fmt.Errorf("llm node's llmParam must be LLMParam, got %v", llmParam)
	}
	convertedLLMParam, err := canvas.IntentDetectorParamsToLLMParam(llmParam)
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

	if err = n.SetInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toDatabaseCustomSQLSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeDatabaseCustomSQL,
		Name: n.Data.Meta.Title,
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

	if err = n.SetInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toDatabaseQuerySchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeDatabaseQuery,
		Name: n.Data.Meta.Title,
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

	selectParam := n.Data.Inputs.SelectParam
	ns.SetConfigKV("Limit", selectParam.Limit)

	queryFields := make([]string, 0)
	for _, v := range selectParam.FieldList {
		queryFields = append(queryFields, strconv.FormatInt(v.FieldID, 10))
	}
	ns.SetConfigKV("QueryFields", queryFields)

	orderClauses := make([]*database.OrderClause, 0, len(selectParam.OrderByList))
	for _, o := range selectParam.OrderByList {
		orderClauses = append(orderClauses, &database.OrderClause{
			FieldID: strconv.FormatInt(o.FieldID, 10),
			IsAsc:   o.IsAsc,
		})
	}
	ns.SetConfigKV("OrderClauses", orderClauses)

	clauseGroup := &database.ClauseGroup{}

	if selectParam.Condition != nil {
		clauseGroup, err = buildClauseGroupFromCondition(selectParam.Condition)
		if err != nil {
			return nil, err
		}
	}

	ns.SetConfigKV("ClauseGroup", clauseGroup)

	if err = n.SetDatabaseInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toDatabaseInsertSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeDatabaseInsert,
		Name: n.Data.Meta.Title,
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

	if err = n.SetDatabaseInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toDatabaseDeleteSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeDatabaseDelete,
		Name: n.Data.Meta.Title,
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

	deleteParam := n.Data.Inputs.DeleteParam

	clauseGroup, err := buildClauseGroupFromCondition(&deleteParam.Condition)
	if err != nil {
		return nil, err
	}
	ns.SetConfigKV("ClauseGroup", clauseGroup)

	if err = n.SetDatabaseInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toDatabaseUpdateSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeDatabaseUpdate,
		Name: n.Data.Meta.Title,
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

	updateParam := n.Data.Inputs.UpdateParam
	if updateParam == nil {
		return nil, fmt.Errorf("update param is requird")
	}
	clauseGroup, err := buildClauseGroupFromCondition(&updateParam.Condition)
	if err != nil {
		return nil, err
	}
	ns.SetConfigKV("ClauseGroup", clauseGroup)
	if err = n.SetDatabaseInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toHttpRequesterSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeHTTPRequester,
		Name: n.Data.Meta.Title,
	}

	inputs := n.Data.Inputs

	method := inputs.APIInfo.Method
	ns.SetConfigKV("Method", method)
	url := inputs.APIInfo.URL

	ns.SetConfigKV("URLConfig", httprequester.URLConfig{
		Tpl: strings.TrimSpace(url),
	})

	if inputs.Auth != nil && inputs.Auth.AuthOpen {
		auth := &httprequester.AuthenticationConfig{}
		ty, err := canvas.ConvertAuthType(inputs.Auth.AuthType)
		if err != nil {
			return nil, err
		}
		auth.Type = ty
		location, err := canvas.ConvertLocation(inputs.Auth.AuthData.CustomData.AddTo)
		if err != nil {
			return nil, err
		}
		auth.Location = location

		ns.SetConfigKV("AuthConfig", auth)

	}

	bodyConfig := httprequester.BodyConfig{}

	bodyConfig.BodyType = httprequester.BodyType(inputs.Body.BodyType)
	switch httprequester.BodyType(inputs.Body.BodyType) {
	case httprequester.BodyTypeJSON:
		jsonTpl := inputs.Body.BodyData.Json
		bodyConfig.TextJsonConfig = &httprequester.TextJsonConfig{
			Tpl: jsonTpl,
		}
	case httprequester.BodyTypeFormData:
		bodyConfig.FormDataConfig = &httprequester.FormDataConfig{
			FileTypeMapping: map[string]bool{},
		}
		for i := range inputs.Body.BodyData.FormData.Data {
			p := inputs.Body.BodyData.FormData.Data[i]
			if p.Input.Type == canvas.VariableTypeString && p.Input.AssistType > canvas.AssistTypeNotSet && p.Input.AssistType < canvas.AssistTypeTime {
				bodyConfig.FormDataConfig.FileTypeMapping[p.Name] = true
			}
		}
	case httprequester.BodyTypeRawText:
		TextTpl := inputs.Body.BodyData.RawText
		bodyConfig.TextPlainConfig = &httprequester.TextPlainConfig{
			Tpl: TextTpl,
		}

	}
	ns.SetConfigKV("BodyConfig", bodyConfig)

	if inputs.Setting != nil {
		ns.SetConfigKV("Timeout", time.Duration(inputs.Setting.Timeout)*time.Second)
		ns.SetConfigKV("RetryTimes", uint64(inputs.Setting.RetryTimes))
	}

	if inputs.SettingOnError != nil {
		ns.SetConfigKV("IgnoreException", inputs.SettingOnError.Switch)
		if inputs.SettingOnError.Switch {
			defaultOut := make(map[string]any)
			err := sonic.UnmarshalString(inputs.SettingOnError.DataOnErr, &defaultOut)
			if err != nil {
				return nil, err
			}
			ns.SetConfigKV("DefaultOutput", defaultOut)
		}
	}

	if err := n.SetHttpRequesterInputsForNodeSchema(ns); err != nil {
		return nil, err
	}
	if err := n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}
	return ns, nil
}

func toKnowledgeIndexerSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeKnowledgeIndexer,
		Name: n.Data.Meta.Title,
	}

	inputs := n.Data.Inputs
	param := inputs.DatasetParam[0]
	knowledgeID, err := strconv.ParseInt(param.Input.Value.Content.(string), 10, 64)
	if err != nil {
		return nil, err
	}

	ns.SetConfigKV("KnowledgeID", knowledgeID)
	ps := inputs.StrategyParam.ParsingStrategy
	parseMode, err := canvas.ConvertParsingType(ps.ParsingType)
	if err != nil {
		return nil, err
	}
	parsingStrategy := &knowledge.ParsingStrategy{
		ParseMode:    parseMode,
		ImageOCR:     ps.ImageOcr,
		ExtractImage: ps.ImageExtraction,
		ExtractTable: ps.TableExtraction,
	}

	ns.SetConfigKV("ParsingStrategy", parsingStrategy)
	cs := inputs.StrategyParam.ChunkStrategy
	chunkType, err := canvas.ConvertChunkType(cs.ChunkType)
	if err != nil {
		return nil, err
	}
	chunkingStrategy := &knowledge.ChunkingStrategy{
		ChunkType: chunkType,
		Separator: cs.Separator,
		ChunkSize: cs.MaxToken,
		Overlap:   int64(cs.Overlap * float64(cs.MaxToken)),
	}
	ns.SetConfigKV("ChunkingStrategy", chunkingStrategy)

	if err = n.SetInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toKnowledgeRetrieverSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeKnowledgeRetriever,
		Name: n.Data.Meta.Title,
	}

	inputs := n.Data.Inputs
	datasetListInfoParam := inputs.DatasetParam[0]
	datasetIDs := datasetListInfoParam.Input.Value.Content.([]string)
	knowledgeIDs := make([]int64, 0, len(datasetIDs))
	for _, id := range datasetIDs {
		k, err := strconv.ParseInt(id, 10, 64)
		if err != nil {
			return nil, err
		}
		knowledgeIDs = append(knowledgeIDs, k)
	}
	ns.SetConfigKV("knowledgeIDs", knowledgeIDs)

	retrievalStrategy := &knowledge.RetrievalStrategy{}

	topK, err := cast.ToInt64E(inputs.DatasetParam[1].Input.Value.Content)
	if err != nil {
		return nil, err
	}
	retrievalStrategy.TopK = &topK

	useRerank, err := cast.ToBoolE(inputs.DatasetParam[2].Input.Value.Content)
	if err != nil {
		return nil, err
	}
	retrievalStrategy.EnableRerank = useRerank

	useRewrite, err := cast.ToBoolE(inputs.DatasetParam[3].Input.Value.Content)
	if err != nil {
		return nil, err
	}
	retrievalStrategy.EnableQueryRewrite = useRewrite

	isPersonalOnly, err := cast.ToBoolE(inputs.DatasetParam[4].Input.Value.Content)
	if err != nil {
		return nil, err
	}
	retrievalStrategy.IsPersonalOnly = isPersonalOnly

	useNl2sql, err := cast.ToBoolE(inputs.DatasetParam[5].Input.Value.Content)
	if err != nil {
		return nil, err
	}
	retrievalStrategy.EnableNL2SQL = useNl2sql

	minScore, err := cast.ToFloat64E(inputs.DatasetParam[6].Input.Value.Content)
	if err != nil {
		return nil, err
	}
	retrievalStrategy.MinScore = &minScore

	strategy, err := cast.ToInt64E(inputs.DatasetParam[7].Input.Value.Content)
	if err != nil {
		return nil, err
	}
	searchType, err := canvas.ConvertRetrievalSearchType(strategy)
	if err != nil {
		return nil, err
	}
	retrievalStrategy.SearchType = searchType

	ns.SetConfigKV("RetrievalStrategy", retrievalStrategy)

	if err = n.SetInputsForNodeSchema(ns); err != nil {
		return nil, err
	}

	if err = n.SetOutputTypesForNodeSchema(ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func toVariableAssignerSchema(n *canvas.Node) (*compose.NodeSchema, error) {
	ns := &compose.NodeSchema{
		Key:  nodes.NodeKey(n.ID),
		Type: nodes.NodeTypeVariableAssigner,
		Name: n.Data.Meta.Title,
	}

	var pairs = make([]*variableassigner.Pair, 0, len(n.Data.Inputs.InputParameters))
	for i, param := range n.Data.Inputs.InputParameters {
		if param.Left == nil || param.Right == nil {
			return nil, fmt.Errorf("variable assigner node's param left or right is nil")
		}

		leftSources, err := param.Left.ToFieldInfo(einoCompose.FieldPath{fmt.Sprintf("left_%d", i)}, n.Parent())
		if err != nil {
			return nil, err
		}

		if leftSources[0].Source.Ref == nil {
			return nil, fmt.Errorf("variable assigner node's param left source ref is nil")
		}

		if leftSources[0].Source.Ref.VariableType == nil {
			return nil, fmt.Errorf("variable assigner node's param left source ref's variable type is nil")
		}

		if *leftSources[0].Source.Ref.VariableType == variable.GlobalSystem {
			return nil, fmt.Errorf("variable assigner node's param left's ref's variable type cannot be variable.GlobalSystem")
		}
		ns.AddInputSource(leftSources...)

		rightSources, err := param.Right.ToFieldInfo(einoCompose.FieldPath{fmt.Sprintf("right_%d", i)}, n.Parent())
		if err != nil {
			return nil, err
		}
		ns.AddInputSource(rightSources...)
		pair := &variableassigner.Pair{
			Left:  *leftSources[0].Source.Ref,
			Right: rightSources[0].Path,
		}

		pairs = append(pairs, pair)
	}
	ns.SetConfigKV("Pairs", pairs)
	return ns, nil
}

func buildClauseGroupFromCondition(condition *canvas.DBCondition) (*database.ClauseGroup, error) {
	clauseGroup := &database.ClauseGroup{}
	if len(condition.ConditionList) == 1 {
		params := condition.ConditionList[0]
		clause, err := buildClauseFromParams(params)
		if err != nil {
			return nil, err
		}
		clauseGroup.Single = clause
	} else {
		relation, err := canvas.ConvertLogicTypeToRelation(condition.Logic)
		if err != nil {
			return nil, err
		}
		clauseGroup.Multi = &database.MultiClause{
			Clauses:  make([]*database.Clause, 0, len(condition.ConditionList)),
			Relation: relation,
		}
		for i := range condition.ConditionList {
			params := condition.ConditionList[i]
			clause, err := buildClauseFromParams(params)
			if err != nil {
				return nil, err
			}
			clauseGroup.Multi.Clauses = append(clauseGroup.Multi.Clauses, clause)
		}
	}

	return clauseGroup, nil
}

func buildClauseFromParams(params []*canvas.Param) (*database.Clause, error) {
	var left, operation *canvas.Param
	for _, p := range params {
		if p.Name == "left" {
			left = p
			continue
		}
		if p.Name == "operation" {
			operation = p
			continue
		}
	}
	if left == nil {
		return nil, fmt.Errorf("left clause is required")
	}
	if operation == nil {
		return nil, fmt.Errorf("operation clause is required")
	}
	operator, err := canvas.OperationToDatasetOperator(operation.Input.Value.Content.(string))
	if err != nil {
		return nil, err
	}
	clause := &database.Clause{
		Left:     left.Input.Value.Content.(string),
		Operator: operator,
	}

	return clause, nil
}
