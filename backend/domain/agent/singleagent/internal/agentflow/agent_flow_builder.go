/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package agentflow

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/flow/agent/react"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/embedding"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type Config struct {
	Agent                   *entity.SingleAgent
	UserID                  string
	Identity                *entity.AgentIdentity
	ModelMgr                modelmgr.Manager
	ModelFactory            chatmodel.Factory
	CPStore                 compose.CheckPointStore
	Embedder                embedding.Embedder
}

const (
	keyOfPersonRender           = "persona_render"
	keyOfKnowledgeRetriever     = "knowledge_retriever"
	keyOfKnowledgeRetrieverPack = "knowledge_retriever_pack"
	keyOfPromptVariables        = "prompt_variables"
	keyOfPromptTemplate         = "prompt_template"
	keyOfReActAgent             = "react_agent"
	keyOfReActAgentToolsNode    = "agent_tool"
	keyOfReActAgentChatModel    = "re_act_chat_model"
	keyOfLLM                    = "llm"
	keyOfToolsPreRetriever      = "tools_pre_retriever"
)

func BuildAgent(ctx context.Context, conf *Config) (r *AgentRunner, err error) {
	persona := conf.Agent.Prompt.GetPrompt()

	avConf := &variableConf{
		Agent:       conf.Agent,
		UserID:      conf.UserID,
		ConnectorID: conf.Identity.ConnectorID,
		Embedder:    conf.Embedder,
	}
	promptVars := &promptVariables{
		Agent: conf.Agent,
		avs:   nil, // 不再直接注入变量
	}

	personaVars := &personaRender{
		personaVariableNames: extractJinja2Placeholder(persona),
		persona:              persona,
		variables:            nil, // 不再直接注入变量到 persona
	}

	kr, err := newKnowledgeRetriever(ctx, &retrieverConfig{
		knowledgeConfig: conf.Agent.Knowledge,
	})
	if err != nil {
		return nil, err
	}

	modelInfo, err := loadModelInfo(ctx, conf.ModelMgr, ptr.From(conf.Agent.ModelInfo.ModelId), conf.Agent.SpaceID)
	if err != nil {
		return nil, err
	}

	chatModel, err := newChatModel(ctx, &config{
		modelFactory:      conf.ModelFactory,
		modelInfo:         modelInfo,
		agentModelSetting: conf.Agent.ModelInfo,
	})
	if err != nil {
		return nil, err
	}

	requireCheckpoint := false
	pluginTools, err := newPluginTools(ctx, &toolConfig{
		spaceID:       conf.Agent.SpaceID,
		userID:        conf.UserID,
		agentIdentity: conf.Identity,
		toolConf:      conf.Agent.Plugin,
	})
	if err != nil {
		return nil, err
	}
	tr := newPreToolRetriever(&toolPreCallConf{})

	wfTools, returnDirectlyTools, err := newWorkflowTools(ctx, &workflowConfig{
		wfInfos: conf.Agent.Workflow,
	})
	if err != nil {
		return nil, err
	}

	var dbTools []tool.InvokableTool
	if len(conf.Agent.Database) > 0 {
		dbTools, err = newDatabaseTools(ctx, &databaseConfig{
			spaceID:       conf.Agent.SpaceID,
			userID:        conf.UserID,
			agentIdentity: conf.Identity,
			databaseConf:  conf.Agent.Database,
		})
		if err != nil {
			return nil, err
		}
	}

	var avTools []tool.InvokableTool
	// 🔥 修复：始终启用记忆工具，不依赖预定义变量
	// 现在支持动态创建变量，即使没有预定义变量也应该提供记忆功能
	avTools, err = newAgentVariableTools(ctx, avConf)
	if err != nil {
		return nil, err
	}
	
	// 添加外部知识库工具（如果配置了dataset_ids）
	var externalKnowledgeTools []tool.InvokableTool
	if conf.Agent.ExternalKnowledge != nil && len(conf.Agent.ExternalKnowledge.DatasetIds) > 0 {
		externalKnowledgeConfig := &externalKnowledgeConfig{
			spaceID:           conf.Agent.SpaceID,
			userID:            conf.UserID,
			agentIdentity:     conf.Identity,
			botID:             fmt.Sprintf("%d", conf.Agent.AgentID),
			externalKnowledge: conf.Agent.ExternalKnowledge,
		}
		externalKnowledgeTools, err = newExternalKnowledgeTools(ctx, externalKnowledgeConfig)
		if err != nil {
			return nil, err
		}
	}
	
	containWfTool := false

	if len(wfTools) > 0 {
		containWfTool = true
	}
	agentTools := make([]tool.BaseTool, 0, len(pluginTools)+len(wfTools)+len(dbTools)+len(avTools)+len(externalKnowledgeTools))
	agentTools = append(agentTools, slices.Transform(pluginTools, func(a tool.InvokableTool) tool.BaseTool {
		return a
	})...)
	agentTools = append(agentTools, slices.Transform(wfTools, func(a workflow.ToolFromWorkflow) tool.BaseTool { return a.(tool.BaseTool) })...)
	agentTools = append(agentTools, slices.Transform(dbTools, func(a tool.InvokableTool) tool.BaseTool {
		return a
	})...)

	agentTools = append(agentTools, slices.Transform(avTools, func(a tool.InvokableTool) tool.BaseTool {
		return a
	})...)
	
	// 添加外部知识库工具
	agentTools = append(agentTools, slices.Transform(externalKnowledgeTools, func(a tool.InvokableTool) tool.BaseTool {
		return a
	})...)

	var isReActAgent bool
	if len(agentTools) > 0 {
		isReActAgent = true
		requireCheckpoint = true
		if modelInfo.Meta.Capability != nil && !modelInfo.Meta.Capability.FunctionCall {
			return nil, fmt.Errorf("model %v does not support function call", modelInfo.Name)
		}
	}

	var agentGraph compose.AnyGraph
	var agentNodeOpts []compose.GraphAddNodeOpt
	var agentNodeName string
	if isReActAgent {
		reactConfig := &react.AgentConfig{
			ToolCallingModel: chatModel,
			ToolsConfig: compose.ToolsNodeConfig{
				Tools: agentTools,
			},
			ToolReturnDirectly: returnDirectlyTools,
			ModelNodeName:      keyOfReActAgentChatModel,
			ToolsNodeName:      keyOfReActAgentToolsNode,
		}
		
		// 根据模型类型自适应选择StreamToolCallChecker
		// 某些模型（如Qwen、Claude）会先输出文本再输出工具调用
		// 需要使用兼容的checker
		needsCompatibleChecker := false
		
		// 首先检查是否通过环境变量强制使用兼容模式
		if shouldUseCompatibleChecker() {
			needsCompatibleChecker = true
			logs.CtxInfof(ctx, "[AgentBuilder] Force using compatible tool call checker (env: FORCE_COMPATIBLE_TOOL_CHECKER=true)")
		} else if modelInfo != nil && modelInfo.Name != "" {
			modelName := strings.ToLower(modelInfo.Name)
			
			// Qwen系列模型
			if strings.Contains(modelName, "qwen") {
				needsCompatibleChecker = true
				logs.CtxInfof(ctx, "[AgentBuilder] Detected Qwen model '%s', using compatible tool call checker", modelInfo.Name)
			}
			// Claude系列模型
			if strings.Contains(modelName, "claude") {
				needsCompatibleChecker = true
				logs.CtxInfof(ctx, "[AgentBuilder] Detected Claude model '%s', using compatible tool call checker", modelInfo.Name)
			}
			// 通义千问系列（阿里的模型）
			if strings.Contains(modelName, "tongyi") || strings.Contains(modelName, "qianwen") {
				needsCompatibleChecker = true
				logs.CtxInfof(ctx, "[AgentBuilder] Detected Tongyi/Qianwen model '%s', using compatible tool call checker", modelInfo.Name)
			}
			// Gemini系列模型
			if strings.Contains(modelName, "gemini") {
				needsCompatibleChecker = true
				logs.CtxInfof(ctx, "[AgentBuilder] Detected Gemini model '%s', using compatible tool call checker", modelInfo.Name)
			}
		}
		
		// 如果需要兼容的checker，使用自定义实现
		if needsCompatibleChecker {
			reactConfig.StreamToolCallChecker = adaptiveToolCallChecker
			logs.CtxInfof(ctx, "[AgentBuilder] Using adaptive tool call checker for better compatibility")
		} else {
			logs.CtxInfof(ctx, "[AgentBuilder] Using default tool call checker")
		}
		
		agent, err := react.NewAgent(ctx, reactConfig)
		if err != nil {
			return nil, err
		}
		agentGraph, agentNodeOpts = agent.ExportGraph()

		agentNodeName = keyOfReActAgent
	} else {
		agentNodeName = keyOfLLM
	}

	suggestGraph, nsg := newSuggestGraph(ctx, conf, chatModel)

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
		compose.WithNodeName(keyOfKnowledgeRetriever))

	_ = g.AddLambdaNode(keyOfToolsPreRetriever,
		compose.InvokableLambda[*AgentRequest, []*schema.Message](tr.toolPreRetrieve),
		compose.WithOutputKey(keyOfToolsPreRetriever),
		compose.WithNodeName(keyOfToolsPreRetriever),
	)
	_ = g.AddLambdaNode(keyOfKnowledgeRetrieverPack,
		compose.InvokableLambda[[]*schema.Document, string](kr.PackRetrieveResultInfo),
		compose.WithOutputKey(placeholderOfKnowledge),
	)
	_ = g.AddChatTemplateNode(keyOfPromptTemplate, chatPrompt)

	agentNodeOpts = append(agentNodeOpts, compose.WithNodeName(agentNodeName))

	if isReActAgent {
		_ = g.AddGraphNode(agentNodeName, agentGraph, agentNodeOpts...)
	} else {
		_ = g.AddChatModelNode(agentNodeName, chatModel, agentNodeOpts...)
	}

	if nsg {
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
	_ = g.AddEdge(compose.START, keyOfToolsPreRetriever)

	_ = g.AddEdge(keyOfPersonRender, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfPromptVariables, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfKnowledgeRetriever, keyOfKnowledgeRetrieverPack)
	_ = g.AddEdge(keyOfKnowledgeRetrieverPack, keyOfPromptTemplate)
	_ = g.AddEdge(keyOfToolsPreRetriever, keyOfPromptTemplate)

	_ = g.AddEdge(keyOfPromptTemplate, agentNodeName)

	if nsg {
		_ = g.AddEdge(agentNodeName, keyOfSuggestPreInputParse)
		_ = g.AddEdge(keyOfSuggestPreInputParse, keyOfSuggestGraph)
		_ = g.AddEdge(keyOfSuggestGraph, compose.END)
	} else {
		_ = g.AddEdge(agentNodeName, compose.END)
	}

	var opts []compose.GraphCompileOption
	if requireCheckpoint {
		opts = append(opts, compose.WithCheckPointStore(conf.CPStore))
	}
	opts = append(opts, compose.WithNodeTriggerMode(compose.AllPredecessor))
	runner, err := g.Compile(ctx, opts...)
	if err != nil {
		return nil, err
	}

	return &AgentRunner{
		runner:              runner,
		requireCheckpoint:   requireCheckpoint,
		modelInfo:           modelInfo,
		containWfTool:       containWfTool,
		returnDirectlyTools: returnDirectlyTools,
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
