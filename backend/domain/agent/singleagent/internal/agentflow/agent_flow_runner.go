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
	"io"

	"github.com/google/uuid"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr"
	singleagent "github.com/coze-dev/coze-studio/backend/crossdomain/agent/model"
	agentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun/model"
	crossworkflow "github.com/coze-dev/coze-studio/backend/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/pkg/urltobase64url"
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

	returnDirectlyTools map[string]struct{}
	containWfTool       bool
	modelInfo           *modelmgr.Model
}

func (r *AgentRunner) StreamExecute(ctx context.Context, req *AgentRequest) (
	sr *schema.StreamReader[*entity.AgentEvent], err error,
) {
	executeID := uuid.New()

	hdl, sr, sw := newReplyCallback(ctx, executeID.String(), r.returnDirectlyTools)

	var composeOpts []compose.Option
	var pipeMsgOpt compose.Option
	var workflowMsgSr *schema.StreamReader[*crossworkflow.WorkflowMessage]
	var workflowMsgCloser func()
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
		pipeMsgOpt, workflowMsgSr, workflowMsgCloser = crossworkflow.DefaultSVC().WithMessagePipe()
		composeOpts = append(composeOpts, pipeMsgOpt)
	}

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
	if r.containWfTool && workflowMsgSr != nil {
		safego.Go(ctx, func() {
			r.processWfMidAnswerStream(ctx, sw, workflowMsgSr)
		})
	}
	safego.Go(ctx, func() {
		defer func() {
			if pe := recover(); pe != nil {
				logs.CtxErrorf(ctx, "[AgentRunner] StreamExecute recover, err: %v", pe)

				sw.Send(nil, errors.New("internal server error"))
			}
			if workflowMsgCloser != nil {
				workflowMsgCloser()
			}
			sw.Close()
		}()
		_, _ = r.runner.Stream(ctx, req, composeOpts...)
	})

	return sr, nil
}

func (r *AgentRunner) processWfMidAnswerStream(_ context.Context, sw *schema.StreamWriter[*entity.AgentEvent], wfStream *schema.StreamReader[*crossworkflow.WorkflowMessage]) {
	streamInitialized := false
	var srT *schema.StreamReader[*schema.Message]
	var swT *schema.StreamWriter[*schema.Message]
	defer func() {
		if swT != nil {
			swT.Close()
		}
		wfStream.Close()
	}()
	for {
		msg, err := wfStream.Recv()

		if err == io.EOF {
			break
		}
		if msg == nil || msg.DataMessage == nil {
			continue
		}

		if msg.DataMessage.NodeType != crossworkflow.NodeTypeOutputEmitter {
			continue
		}
		if !streamInitialized {
			streamInitialized = true
			srT, swT = schema.Pipe[*schema.Message](5)
			sw.Send(&entity.AgentEvent{
				EventType:     singleagent.EventTypeOfToolMidAnswer,
				ToolMidAnswer: srT,
			}, nil)
		}
		swT.Send(&schema.Message{
			Role:    msg.DataMessage.Role,
			Content: msg.DataMessage.Content,
			Extra: func(msg *crossworkflow.WorkflowMessage) map[string]any {

				extra := make(map[string]any)
				extra["workflow_node_name"] = msg.NodeTitle
				if msg.DataMessage.Last {
					extra["is_finish"] = true
				}
				return extra
			}(msg),
		}, nil)
	}
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
				v.ImageURL = transImageURLToBase64(v.ImageURL, r.enableLocalFileToLLMWithBase64())
				multiContent = append(multiContent, v)
			}
		case schema.ChatMessagePartTypeFileURL:
			if !r.isSupportFile() {
				unSupportMultiPart = append(unSupportMultiPart, v)
			} else {
				v.FileURL = transFileURLToBase64(v.FileURL, r.enableLocalFileToLLMWithBase64())
				multiContent = append(multiContent, v)
			}
		case schema.ChatMessagePartTypeAudioURL:
			if !r.isSupportAudio() {
				unSupportMultiPart = append(unSupportMultiPart, v)
			} else {
				v.AudioURL = transAudioURLToBase64(v.AudioURL, r.enableLocalFileToLLMWithBase64())
				multiContent = append(multiContent, v)
			}
		case schema.ChatMessagePartTypeVideoURL:
			if !r.isSupportVideo() {
				unSupportMultiPart = append(unSupportMultiPart, v)
			} else {
				v.VideoURL = transVideoURLToBase64(v.VideoURL, r.enableLocalFileToLLMWithBase64())
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
	return r.modelInfo.Capability.GetSupportMultiModal()
}
func (r *AgentRunner) isSupportImage() bool {
	return r.modelInfo.Capability.GetImageUnderstanding()
}
func (r *AgentRunner) isSupportFile() bool {
	return false
}
func (r *AgentRunner) isSupportAudio() bool {
	return r.modelInfo.Capability.GetAudioUnderstanding()
}
func (r *AgentRunner) isSupportVideo() bool {
	return r.modelInfo.Capability.GetVideoUnderstanding()
}

func (r *AgentRunner) enableLocalFileToLLMWithBase64() bool {
	return r.modelInfo.EnableBase64URL
}

func transImageURLToBase64(imageUrl *schema.ChatMessageImageURL, enableBase64Url bool) *schema.ChatMessageImageURL {
	if !enableBase64Url {
		return imageUrl
	}
	fileData, err := urltobase64url.URLToBase64(imageUrl.URL)
	if err != nil {
		return imageUrl
	}
	imageUrl.URL = fileData.Base64Url
	imageUrl.MIMEType = fileData.MimeType
	return imageUrl
}

func transFileURLToBase64(fileUrl *schema.ChatMessageFileURL, enableBase64Url bool) *schema.ChatMessageFileURL {

	if !enableBase64Url {
		return fileUrl
	}
	fileData, err := urltobase64url.URLToBase64(fileUrl.URL)
	if err != nil {
		return fileUrl
	}
	fileUrl.URL = fileData.Base64Url
	fileUrl.MIMEType = fileData.MimeType
	return fileUrl
}

func transAudioURLToBase64(audioUrl *schema.ChatMessageAudioURL, enableBase64Url bool) *schema.ChatMessageAudioURL {

	if !enableBase64Url {
		return audioUrl
	}
	fileData, err := urltobase64url.URLToBase64(audioUrl.URL)
	if err != nil {
		return audioUrl
	}
	audioUrl.URL = fileData.Base64Url
	audioUrl.MIMEType = fileData.MimeType
	return audioUrl
}

func transVideoURLToBase64(videoUrl *schema.ChatMessageVideoURL, enableBase64Url bool) *schema.ChatMessageVideoURL {

	if !enableBase64Url {
		return videoUrl
	}
	fileData, err := urltobase64url.URLToBase64(videoUrl.URL)
	if err != nil {
		return videoUrl
	}
	videoUrl.URL = fileData.Base64Url
	videoUrl.MIMEType = fileData.MimeType
	return videoUrl
}
