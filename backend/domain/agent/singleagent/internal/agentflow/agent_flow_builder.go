package agentflow

import (
	"context"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/flow/agent/react"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type Config struct {
	Agent *entity.SingleAgent

	PluginSvr    crossdomain.PluginService
	KnowledgeSvr crossdomain.Knowledge
	WorkflowSvr  crossdomain.Workflow
	VariablesSvr crossdomain.Variables
	ModelMgrSvr  crossdomain.ModelMgr
	ModelFactory chatmodel.Factory
	DatabaseSvr  crossdomain.Database
}

const (
	keyOfPersonRender       = "persona_render"
	keyOfKnowledgeRetriever = "knowledge_retriever"
	keyOfPromptVariables    = "prompt_variables"
	keyOfPromptTemplate     = "prompt_template"
	keyOfReActAgent         = "react_agent"
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
		svr:             conf.KnowledgeSvr,
	})
	if err != nil {
		return nil, err
	}

	chatModel, err := newChatModel(ctx, &config{
		modelFactory: conf.ModelFactory,
		modelManager: conf.ModelMgrSvr,
		modelInfo:    conf.Agent.ModelInfo,
	})
	if err != nil {
		return nil, err
	}

	pluginTools, err := newPluginTools(ctx, &toolConfig{
		toolConf: conf.Agent.Plugin,
		svr:      conf.PluginSvr,
	})
	if err != nil {
		return nil, err
	}

	wfTools, err := newWorkflowTools(ctx, &workflowConfig{
		wfInfos: conf.Agent.Workflow,
		wfSvr:   conf.WorkflowSvr,
	})
	if err != nil {
		return nil, err
	}

	var dbTools []tool.InvokableTool
	if conf.DatabaseSvr != nil && len(conf.Agent.Database) > 0 {
		dbTools, err = newDatabaseTools(ctx, &databaseConfig{
			databaseConf: conf.Agent.Database,
			dbSvr:        conf.DatabaseSvr,
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

	agent, err := react.NewAgent(ctx, &react.AgentConfig{
		Model: chatModel,
		ToolsConfig: compose.ToolsNodeConfig{
			Tools: agentTools,
		},
	})
	if err != nil {
		return nil, err
	}

	agentGraph, agentNodeOpts := agent.ExportGraph()

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
		compose.WithOutputKey(placeholderOfKnowledge),
		compose.WithNodeName(keyOfKnowledgeRetriever))

	_ = g.AddChatTemplateNode(keyOfPromptTemplate, chatPrompt)
	_ = g.AddGraphNode(keyOfReActAgent, agentGraph, agentNodeOpts...)

	_ = g.AddEdge(compose.START, keyOfPersonRender)
	_ = g.AddEdge(compose.START, keyOfPromptVariables)
	_ = g.AddEdge(compose.START, keyOfKnowledgeRetriever)

	_ = g.AddEdge(keyOfPersonRender, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfPromptVariables, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfKnowledgeRetriever, keyOfPromptTemplate)

	_ = g.AddEdge(keyOfPromptTemplate, keyOfReActAgent)

	_ = g.AddEdge(keyOfReActAgent, compose.END)

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
