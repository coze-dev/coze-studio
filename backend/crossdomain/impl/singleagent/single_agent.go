package agent

import (
	"context"
	"encoding/json"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/agentrun"
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/singleagent"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossagent"
	singleagent "code.byted.org/flow/opencoze/backend/domain/agent/singleagent/service"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

var defaultSVC crossagent.SingleAgent

type impl struct {
	DomainSVC singleagent.SingleAgent
}

func InitDomainService(c singleagent.SingleAgent) crossagent.SingleAgent {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *impl) StreamExecute(ctx context.Context, historyMsg []*message.Message,
	query *message.Message, agentRuntime *model.AgentRuntime,
) (*schema.StreamReader[*model.AgentEvent], error) {
	singleAgentStreamExecReq := c.buildReq2SingleAgentStreamExecute(historyMsg, query, agentRuntime)

	streamEvent, err := c.DomainSVC.StreamExecute(ctx, singleAgentStreamExecReq)
	logs.CtxInfof(ctx, "agent StreamExecute req:%v, streamEvent:%v, err:%v", conv.DebugJsonToStr(singleAgentStreamExecReq), streamEvent, err)
	return streamEvent, err
}

func (c *impl) buildReq2SingleAgentStreamExecute(historyMsg []*message.Message,
	input *message.Message, agentRuntime *model.AgentRuntime,
) *model.ExecuteRequest {
	identity := c.buildIdentity(input, agentRuntime)
	inputBuild := c.buildSchemaMessage([]*message.Message{input})
	history := c.buildSchemaMessage(historyMsg)

	return &model.ExecuteRequest{
		Identity: identity,
		Input:    inputBuild[0],
		History:  history,
		UserID:   input.UserID,
		SpaceID:  agentRuntime.SpaceID,
		PreCallTools: slices.Transform(agentRuntime.PreRetrieveTools, func(tool *agentrun.Tool) *agentrun.ToolsRetriever {
			return &agentrun.ToolsRetriever{
				PluginID:  tool.PluginID,
				ToolName:  tool.ToolName,
				ToolID:    tool.ToolID,
				Arguments: tool.Arguments,
				Type: func(toolType agentrun.ToolType) agentrun.ToolType {
					switch toolType {
					case agentrun.ToolTypeWorkflow:
						return agentrun.ToolTypeWorkflow
					case agentrun.ToolTypePlugin:
						return agentrun.ToolTypePlugin
					}
					return agentrun.ToolTypePlugin
				}(tool.Type),
			}
		}),
	}
}

func (c *impl) buildSchemaMessage(msgs []*message.Message) []*schema.Message {
	schemaMessage := make([]*schema.Message, 0, len(msgs))

	for _, msgOne := range msgs {
		if msgOne.ModelContent == "" {
			continue
		}
		if msgOne.MessageType == message.MessageTypeVerbose || msgOne.MessageType == message.MessageTypeFlowUp {
			continue
		}
		var message *schema.Message
		err := json.Unmarshal([]byte(msgOne.ModelContent), &message)
		if err != nil {
			continue
		}
		schemaMessage = append(schemaMessage, message)
	}

	return schemaMessage
}

func (c *impl) buildIdentity(input *message.Message, agentRuntime *model.AgentRuntime) *model.AgentIdentity {
	return &model.AgentIdentity{
		AgentID:     input.AgentID,
		Version:     agentRuntime.AgentVersion,
		IsDraft:     agentRuntime.IsDraft,
		ConnectorID: agentRuntime.ConnectorID,
	}
}

func (c *impl) GetSingleAgent(ctx context.Context, agentID int64, version string) (agent *model.SingleAgent, err error) {
	agentInfo, err := c.DomainSVC.GetSingleAgent(ctx, agentID, version)
	if err != nil {
		return nil, err
	}

	return agentInfo.SingleAgent, nil
}
