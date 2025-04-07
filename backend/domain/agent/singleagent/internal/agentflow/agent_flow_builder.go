package agentflow

import (
	"context"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/flow/agent/react"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/crossdomain"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
)

type Config struct {
	Agent *entity.SingleAgent

	Plugin       crossdomain.PluginService
	Knowledge    crossdomain.Knowledge
	Workflow     crossdomain.Workflow
	Variables    crossdomain.Variables
	ModelManager crossdomain.ModelMgr
	ModelFactory chatmodel.Factory
}

func BuildAgent(ctx context.Context, conf *Config) (r *AgentRunner, err error) {
	const (
		keyOfPersonaVariables   = "persona_variables"
		keyOfPersonRender       = "persona_render"
		keyOfKnowledgeRetriever = "knowledge_retriever"
		keyOfPromptVariables    = "prompt_variables"
		keyOfPromptTemplate     = "prompt_template"
		keyOfReActAgent         = "react_agent"
	)

	persona := conf.Agent.Prompt.Persona

	personaVars := &personaRender{
		personaVariableNames: extractJinja2Placeholder(persona),
		// variables:            conf.Variables,
	}

	promptVars := &promptVariables{
		Agent: conf.Agent,
	}

	kl := &knowledge{}

	chatModel, err := newChatModel(ctx, &config{
		modelManager: conf.ModelManager,
		modelInfo:    conf.Agent.Model,
	})
	if err != nil {
		return nil, err
	}

	agent, err := react.NewAgent(ctx, &react.AgentConfig{
		Model: chatModel,
		ToolsConfig: compose.ToolsNodeConfig{
			Tools: nil,
		},
	})
	if err != nil {
		return nil, err
	}

	agentGraph, agentNodeOpts := agent.ExportGraph()

	g := compose.NewGraph[*AgentRequest, *schema.Message](compose.WithGenLocalState(func(ctx context.Context) (state *AgentState) {
		return &AgentState{}
	}))

	_ = g.AddLambdaNode(keyOfPersonRender,
		compose.InvokableLambda[*AgentRequest, string](personaVars.RenderPersona),
		compose.WithOutputKey(placeholderOfPersona))

	_ = g.AddLambdaNode(keyOfPromptVariables,
		compose.InvokableLambda[*AgentRequest, map[string]any](promptVars.AssemblePromptVariables))

	_ = g.AddLambdaNode(keyOfKnowledgeRetriever,
		compose.InvokableLambda[*AgentRequest, []*schema.Document](kl.Retrieve),
		compose.WithOutputKey(placeholderOfKnowledge))

	_ = g.AddChatTemplateNode(keyOfPromptTemplate, chatPrompt)

	_ = g.AddGraphNode(keyOfReActAgent, agentGraph, agentNodeOpts...)

	_ = g.AddEdge(compose.START, keyOfPersonaVariables)
	_ = g.AddEdge(keyOfPersonaVariables, keyOfPersonRender)

	_ = g.AddEdge(compose.START, keyOfPromptVariables)

	_ = g.AddEdge(compose.START, keyOfKnowledgeRetriever)

	_ = g.AddEdge(keyOfPromptVariables, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfPersonRender, keyOfPromptTemplate)
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
