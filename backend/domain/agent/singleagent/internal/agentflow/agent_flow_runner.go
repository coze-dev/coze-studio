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
	"errors"
	"slices"

	"github.com/google/uuid"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/agentrun"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/singleagent"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossworkflow"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type AgentState struct {
	Messages                 []*schema.Message
	UserInput                *schema.Message
	ReturnDirectlyToolCallID string
}

type AgentRequest struct {
	UserID  string
	Input   *schema.Message
	History []*schema.Message

	Identity *singleagent.AgentIdentity

	ResumeInfo   *singleagent.InterruptInfo
	PreCallTools []*agentrun.ToolsRetriever
	Variables    map[string]string
}

type AgentRunner struct {
	runner            compose.Runnable[*AgentRequest, *schema.Message]
	requireCheckpoint bool

	containWfTool bool
	modelInfo     *modelmgr.Model
}

func (r *AgentRunner) StreamExecute(ctx context.Context, req *AgentRequest) (
	sr *schema.StreamReader[*entity.AgentEvent], err error,
) {
	executeID := uuid.New()

	hdl, sr, sw := newReplyCallback(ctx, executeID.String())

	go func() {
		defer func() {
			if pe := recover(); pe != nil {
				logs.CtxErrorf(ctx, "[AgentRunner] StreamExecute recover, err: %v", pe)

				sw.Send(nil, errors.New("internal server error"))
			}
			sw.Close()
		}()

		var composeOpts []compose.Option
		composeOpts = append(composeOpts, compose.WithCallbacks(hdl))
		_ = compose.RegisterSerializableType[*AgentState]("agent_state")
		if r.requireCheckpoint {

			defaultCheckPointID := executeID.String()
			if req.ResumeInfo != nil {
				resumeInfo := req.ResumeInfo
				if resumeInfo.InterruptType != singleagent.InterruptEventType_OauthPlugin {
					defaultCheckPointID = resumeInfo.InterruptID
					opts := crossworkflow.DefaultSVC().WithResumeToolWorkflow(resumeInfo.AllWfInterruptData[resumeInfo.ToolCallID], req.Input.Content, resumeInfo.AllWfInterruptData)
					composeOpts = append(composeOpts, opts)
				}
			}

			composeOpts = append(composeOpts, compose.WithCheckPointID(defaultCheckPointID))
		}
		if r.containWfTool {
			cfReq := crossworkflow.ExecuteConfig{
				AgentID:      &req.Identity.AgentID,
				ConnectorUID: req.UserID,
				ConnectorID:  req.Identity.ConnectorID,
				BizType:      crossworkflow.BizTypeAgent,
			}
			if req.Identity.IsDraft {
				cfReq.Mode = crossworkflow.ExecuteModeDebug
			} else {
				cfReq.Mode = crossworkflow.ExecuteModeRelease
			}
			wfConfig := crossworkflow.DefaultSVC().WithExecuteConfig(cfReq)
			composeOpts = append(composeOpts, wfConfig)
		}
		_, _ = r.runner.Stream(ctx, req, composeOpts...)
	}()

	return sr, nil
}

func (r *AgentRunner) PreHandlerReq(ctx context.Context, req *AgentRequest) *AgentRequest {
	req.Input = r.preHandlerInput(req.Input)
	req.History = r.preHandlerHistory(req.History)
	logs.CtxInfof(ctx, "[AgentRunner] PreHandlerReq, req: %v", conv.DebugJsonToStr(req))

	return req
}

func (r *AgentRunner) preHandlerInput(input *schema.Message) *schema.Message {
	var multiContent []schema.ChatMessagePart

	if len(input.MultiContent) == 0 {
		return input
	}

	unSupportMultiPart := make([]schema.ChatMessagePart, 0, len(input.MultiContent))

	for _, v := range input.MultiContent {
		switch v.Type {
		case schema.ChatMessagePartTypeImageURL:
			if !r.isSupportImage() {
				unSupportMultiPart = append(unSupportMultiPart, v)
			} else {
				multiContent = append(multiContent, v)
			}
		case schema.ChatMessagePartTypeFileURL:
			if !r.isSupportFile() {
				unSupportMultiPart = append(unSupportMultiPart, v)
			} else {
				multiContent = append(multiContent, v)
			}
		case schema.ChatMessagePartTypeAudioURL:
			if !r.isSupportAudio() {
				unSupportMultiPart = append(unSupportMultiPart, v)
			} else {
				multiContent = append(multiContent, v)
			}
		case schema.ChatMessagePartTypeVideoURL:
			if !r.isSupportVideo() {
				unSupportMultiPart = append(unSupportMultiPart, v)
			} else {
				multiContent = append(multiContent, v)
			}
		case schema.ChatMessagePartTypeText:
		default:
			multiContent = append(multiContent, v)
		}
	}

	for _, v := range input.MultiContent {
		if v.Type != schema.ChatMessagePartTypeText {
			continue
		}

		if r.isSupportMultiContent() {
			if len(multiContent) > 0 {
				v.Text = concatContentString(v.Text, unSupportMultiPart)
				multiContent = append(multiContent, v)
			} else {
				input.Content = concatContentString(v.Text, unSupportMultiPart)
			}
		} else {
			input.Content = concatContentString(v.Text, unSupportMultiPart)
		}

	}
	input.MultiContent = multiContent
	return input
}
func concatContentString(textContent string, unSupportTypeURL []schema.ChatMessagePart) string {
	if len(unSupportTypeURL) == 0 {
		return textContent
	}
	for _, v := range unSupportTypeURL {
		switch v.Type {
		case schema.ChatMessagePartTypeImageURL:
			textContent += "  this is a image:" + v.ImageURL.URL
		case schema.ChatMessagePartTypeFileURL:
			textContent += "  this is a file:" + v.FileURL.URL
		case schema.ChatMessagePartTypeAudioURL:
			textContent += "  this is a audio:" + v.AudioURL.URL
		case schema.ChatMessagePartTypeVideoURL:
			textContent += "  this is a video:" + v.VideoURL.URL
		default:
		}
	}
	return textContent
}

func (r *AgentRunner) preHandlerHistory(history []*schema.Message) []*schema.Message {
	var hm []*schema.Message
	for _, msg := range history {
		if msg.Role == schema.User {
			msg = r.preHandlerInput(msg)
		}
		hm = append(hm, msg)
	}
	return hm
}

func (r *AgentRunner) isSupportMultiContent() bool {
	return len(r.modelInfo.Meta.Capability.InputModal) > 1
}
func (r *AgentRunner) isSupportImage() bool {
	return slices.Contains(r.modelInfo.Meta.Capability.InputModal, modelmgr.ModalImage)
}
func (r *AgentRunner) isSupportFile() bool {
	return slices.Contains(r.modelInfo.Meta.Capability.InputModal, modelmgr.ModalFile)
}
func (r *AgentRunner) isSupportAudio() bool {
	return slices.Contains(r.modelInfo.Meta.Capability.InputModal, modelmgr.ModalAudio)
}
func (r *AgentRunner) isSupportVideo() bool {
	return slices.Contains(r.modelInfo.Meta.Capability.InputModal, modelmgr.ModalVideo)
}
