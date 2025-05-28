package agentflow

import (
	"context"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/flow/agent/react"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type Config struct {
	Agent        *entity.SingleAgent
	ConnectorID  int64
	IsDraft      bool
	ModelFactory chatmodel.Factory
}

const (
	keyOfPersonRender       = "persona_render"
	keyOfKnowledgeRetriever = "knowledge_retriever"
	keyOfPromptVariables    = "prompt_variables"
	keyOfPromptTemplate     = "prompt_template"
	keyOfReActAgent         = "react_agent"
	keyOfLLM                = "llm"
)

func BuildAgent(ctx context.Context, conf *Config) (r *AgentRunner, err error) {
	persona := conf.Agent.Prompt.GetPrompt()

	personaVars := &personaRender{
		personaVariableNames: extractJinja2Placeholder(persona),
		// variables:            conf.Variables,
	}

	promptVars := &promptVariables{
		Agent: conf.Agent,
	}

	kr, err := newKnowledgeRetriever(ctx, &retrieverConfig{
		knowledgeConfig: conf.Agent.Knowledge,
	})
	if err != nil {
		return nil, err
	}

	chatModel, err := newChatModel(ctx, &config{
		modelFactory: conf.ModelFactory,
		modelInfo:    conf.Agent.ModelInfo,
	})
	if err != nil {
		return nil, err
	}

	pluginTools, err := newPluginTools(ctx, &toolConfig{
		toolConf: conf.Agent.Plugin,
		agentID:  conf.Agent.AgentID,
		spaceID:  conf.Agent.SpaceID,
		isDraft:  conf.IsDraft,
	})
	if err != nil {
		return nil, err
	}

	wfTools, err := newWorkflowTools(ctx, &workflowConfig{
		wfInfos: conf.Agent.Workflow,
	})
	if err != nil {
		return nil, err
	}

	var dbTools []tool.InvokableTool
	if len(conf.Agent.Database) > 0 {
		dbTools, err = newDatabaseTools(ctx, &databaseConfig{
			databaseConf: conf.Agent.Database,
			connectorID:  ptr.Of(conf.ConnectorID),
			userID:       conf.Agent.CreatorID,
			agentID:      conf.Agent.AgentID,
			spaceID:      conf.Agent.SpaceID,
			isDraft:      conf.IsDraft,
		})
		if err != nil {
			return nil, err
		}
	}

	agentTools := make([]tool.BaseTool, 0, len(pluginTools)+len(wfTools)+len(dbTools))
	agentTools = append(agentTools, slices.Transform(pluginTools, func(a tool.InvokableTool) tool.BaseTool {
		return a
	})...)
	agentTools = append(agentTools, wfTools...)
	agentTools = append(agentTools, slices.Transform(dbTools, func(a tool.InvokableTool) tool.BaseTool {
		return a
	})...)

	var isReActAgent bool
	if len(agentTools) > 0 {
		isReActAgent = true
	}

	var agentGraph compose.AnyGraph
	var agentNodeOpts []compose.GraphAddNodeOpt
	var agentNodeName string
	if isReActAgent {
		agent, err := react.NewAgent(ctx, &react.AgentConfig{
			ToolCallingModel: chatModel,
			ToolsConfig: compose.ToolsNodeConfig{
				Tools: agentTools,
			},
		})
		if err != nil {
			return nil, err
		}
		agentGraph, agentNodeOpts = agent.ExportGraph()

		agentNodeName = keyOfReActAgent
	} else {
		agentNodeName = keyOfLLM
	}

	suggestGraph, ng := newSuggestGraph(ctx, conf, chatModel)

	g := compose.NewGraph[*AgentRequest, *schema.Message](
		compose.WithGenLocalState(func(ctx context.Context) (state *AgentState) {
			return &AgentState{}
		}))

	_ = g.AddLambdaNode(keyOfPersonRender,
		compose.InvokableLambda[*AgentRequest, string](personaVars.RenderPersona),
		compose.WithStatePreHandler(func(ctx context.Context, ar *AgentRequest, state *AgentState) (*AgentRequest, error) {
			state.UserInput = ar.Input
			return ar, nil
		}),
		compose.WithOutputKey(placeholderOfPersona))

	_ = g.AddLambdaNode(keyOfPromptVariables,
		compose.InvokableLambda[*AgentRequest, map[string]any](promptVars.AssemblePromptVariables))

	_ = g.AddLambdaNode(keyOfKnowledgeRetriever,
		compose.InvokableLambda[*AgentRequest, []*schema.Document](kr.Retrieve),
		compose.WithOutputKey(placeholderOfKnowledge),
		compose.WithNodeName(keyOfKnowledgeRetriever))

	_ = g.AddChatTemplateNode(keyOfPromptTemplate, chatPrompt)

	agentNodeOpts = append(agentNodeOpts, compose.WithNodeName(agentNodeName))

	if isReActAgent {
		_ = g.AddGraphNode(agentNodeName, agentGraph, agentNodeOpts...)
	} else {
		_ = g.AddChatModelNode(agentNodeName, chatModel, agentNodeOpts...)
	}

	if ng {
		_ = g.AddLambdaNode(keyOfSuggestPreInputParse, compose.ToList[*schema.Message](),
			compose.WithStatePostHandler(func(ctx context.Context, out []*schema.Message, state *AgentState) ([]*schema.Message, error) {
				out = append(out, state.UserInput)
				return out, nil
			}),
		)
		_ = g.AddGraphNode(keyOfSuggestGraph, suggestGraph)
	}

	_ = g.AddEdge(compose.START, keyOfPersonRender)
	_ = g.AddEdge(compose.START, keyOfPromptVariables)
	_ = g.AddEdge(compose.START, keyOfKnowledgeRetriever)

	_ = g.AddEdge(keyOfPersonRender, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfPromptVariables, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfKnowledgeRetriever, keyOfPromptTemplate)

	_ = g.AddEdge(keyOfPromptTemplate, agentNodeName)

	if ng {
		_ = g.AddEdge(agentNodeName, keyOfSuggestPreInputParse)
		_ = g.AddEdge(keyOfSuggestPreInputParse, keyOfSuggestGraph)
		_ = g.AddEdge(keyOfSuggestGraph, compose.END)
	} else {
		_ = g.AddEdge(agentNodeName, compose.END)
	}

	runner, err := g.Compile(ctx)
	if err != nil {
		return nil, err
	}

	return &AgentRunner{
		runner: runner,
	}, nil
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
