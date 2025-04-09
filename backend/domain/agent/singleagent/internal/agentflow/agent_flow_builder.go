package agentflow

import (
	"context"
	"io"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type Config struct {
	Agent *entity.SingleAgent

	ToolSvr      crossdomain.ToolService
	KnowledgeSvr crossdomain.Knowledge
	WorkflowSvr  crossdomain.Workflow
	VariablesSvr crossdomain.Variables
	ModelManager crossdomain.ModelMgr
	ModelFactory chatmodel.Factory

	ToolReturnDirectly map[string]struct{}
}

const (
	ModelNodeName = "ChatModel"
	ToolsNodeName = "Tools"
)

func BuildAgent(ctx context.Context, conf *Config) (r *AgentRunner, err error) {
	const (
		keyOfPersonaVariables   = "persona_variables"
		keyOfPersonRender       = "persona_render"
		keyOfKnowledgeRetriever = "knowledge_retriever"
		keyOfPromptVariables    = "prompt_variables"
		keyOfPromptTemplate     = "prompt_template"
		keyOfReActAgent         = "react_agent"

		keyOfChatModel = "chat_model"
		keyOfTools     = "tools"
	)

	persona := conf.Agent.Prompt.Prompt

	personaVars := &personaRender{
		personaVariableNames: extractJinja2Placeholder(persona),
		// variables:            conf.Variables,
	}

	promptVars := &promptVariables{
		Agent: conf.Agent,
	}

	kr, err := newKnowledgeRetriever(ctx, &retrieverConfig{
		knowledgeConfig: conf.Agent.Knowledge,
		svr:             conf.KnowledgeSvr,
	})
	if err != nil {
		return nil, err
	}

	chatModel, err := newChatModel(ctx, &config{
		modelManager: conf.ModelManager,
		modelInfo:    conf.Agent.ModelInfo,
	})
	if err != nil {
		return nil, err
	}

	tools, err := newPluginTools(ctx, &toolConfig{
		ToolConf: conf.Agent.Plugin,
		svr:      conf.ToolSvr,
	})
	if err != nil {
		return nil, err
	}

	toolsNode, err := compose.NewToolNode(ctx, &compose.ToolsNodeConfig{
		Tools: slices.Transform(tools, func(a tool.InvokableTool) tool.BaseTool {
			return a
		}),
	})
	if err != nil {
		return nil, err
	}

	g := compose.NewGraph[*AgentRequest, *schema.Message](
		compose.WithGenLocalState(func(ctx context.Context) (state *AgentState) {
			return &AgentState{}
		}))

	_ = g.AddLambdaNode(keyOfPersonRender,
		compose.InvokableLambda[*AgentRequest, string](personaVars.RenderPersona),
		compose.WithOutputKey(placeholderOfPersona))

	_ = g.AddLambdaNode(keyOfPromptVariables,
		compose.InvokableLambda[*AgentRequest, map[string]any](promptVars.AssemblePromptVariables))

	_ = g.AddLambdaNode(keyOfKnowledgeRetriever,
		compose.InvokableLambda[*AgentRequest, []*schema.Document](kr.Retrieve),
		compose.WithOutputKey(placeholderOfKnowledge))

	_ = g.AddChatTemplateNode(keyOfPromptTemplate, chatPrompt)

	modelPreHandle := func(ctx context.Context, input []*schema.Message, state *AgentState) ([]*schema.Message, error) {
		state.Messages = append(state.Messages, input...)
		return state.Messages, nil
	}

	_ = g.AddChatModelNode(keyOfChatModel, chatModel,
		compose.WithStatePreHandler(modelPreHandle),
		compose.WithNodeName(ModelNodeName),
	)

	toolsNodePreHandle := func(ctx context.Context, input *schema.Message, state *AgentState) (*schema.Message, error) {
		state.Messages = append(state.Messages, input)
		state.ReturnDirectlyToolCallID = getReturnDirectlyToolCallID(input, conf.ToolReturnDirectly)
		return input, nil
	}

	_ = g.AddToolsNode(keyOfTools, toolsNode,
		compose.WithStatePreHandler(toolsNodePreHandle),
		compose.WithNodeName(ToolsNodeName))

	modelPostBranchCondition := func(_ context.Context, sr *schema.StreamReader[*schema.Message]) (endNode string, err error) {
		if isToolCall, err := firstChunkStreamToolCallChecker(ctx, sr); err != nil {
			return "", err
		} else if isToolCall {
			return keyOfTools, nil
		}
		return compose.END, nil
	}

	_ = g.AddEdge(compose.START, keyOfPersonaVariables)
	_ = g.AddEdge(keyOfPersonaVariables, keyOfPersonRender)

	_ = g.AddEdge(compose.START, keyOfPromptVariables)

	_ = g.AddEdge(compose.START, keyOfKnowledgeRetriever)

	_ = g.AddEdge(keyOfPromptVariables, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfPersonRender, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfKnowledgeRetriever, keyOfPromptTemplate)

	_ = g.AddEdge(keyOfPromptTemplate, keyOfChatModel)
	_ = g.AddBranch(keyOfChatModel, compose.NewStreamGraphBranch(modelPostBranchCondition,
		map[string]bool{keyOfTools: true, compose.END: true}))
	_ = g.AddEdge(keyOfTools, keyOfChatModel)

	_ = g.AddEdge(keyOfReActAgent, compose.END)

	runner, err := g.Compile(ctx)
	if err != nil {
		return nil, err
	}

	return &AgentRunner{
		runner: runner,
	}, nil
}

func firstChunkStreamToolCallChecker(_ context.Context, sr *schema.StreamReader[*schema.Message]) (bool, error) {
	defer sr.Close()

	for {
		msg, err := sr.Recv()
		if err == io.EOF {
			return false, nil
		}
		if err != nil {
			return false, err
		}

		if len(msg.ToolCalls) > 0 {
			return true, nil
		}

		if len(msg.Content) == 0 { // skip empty chunks at the front
			continue
		}

		return false, nil
	}
}

func getReturnDirectlyToolCallID(input *schema.Message, toolReturnDirectly map[string]struct{}) string {
	if len(toolReturnDirectly) == 0 {
		return ""
	}

	for _, toolCall := range input.ToolCalls {
		if _, ok := toolReturnDirectly[toolCall.Function.Name]; ok {
			return toolCall.ID
		}
	}

	return ""
}

func extractJinja2Placeholder(persona string) (variableNames []string) {
	re := regexp.MustCompile(`{{([^}]*)}}`)
	matches := re.FindAllStringSubmatch(persona, -1)
	variables := make([]string, 0, len(matches))
	for _, match := range matches {
		val := strings.TrimSpace(match[1])
		if val != "" {
			variables = append(variables, match[1])
		}
	}
	return variables
}
