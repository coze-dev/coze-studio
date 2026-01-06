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

package llm

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/pkg/urltobase64url"
)

type prompts struct {
	sp  *promptTpl
	up  *promptTpl
	mwi ModelWithInfo
}

type promptsWithChatHistory struct {
	prompts *prompts
	cfg     *vo.ChatHistorySetting
	mwi     ModelWithInfo
}

func withReservedKeys(keys []string) func(tpl *promptTpl) {
	return func(tpl *promptTpl) {
		tpl.reservedKeys = keys
	}
}

func withAssociateUserInputFields(fs map[string]struct{}) func(tpl *promptTpl) {
	return func(tpl *promptTpl) {
		tpl.associateUserInputFields = fs
	}
}

type promptTpl struct {
	role                     schema.RoleType
	tpl                      string
	parts                    []promptPart
	hasMultiModal            bool
	reservedKeys             []string
	associateUserInputFields map[string]struct{}
}

type promptPart struct {
	part     nodes.TemplatePart
	fileType *vo.FileSubType
}

func newPromptTpl(role schema.RoleType,
	tpl string,
	inputTypes map[string]*vo.TypeInfo,
	opts ...func(*promptTpl),
) *promptTpl {
	if len(tpl) == 0 {
		return nil
	}

	pTpl := &promptTpl{
		role: role,
		tpl:  tpl,
	}
	for _, opt := range opts {
		opt(pTpl)
	}

	parts := nodes.ParseTemplate(tpl)
	promptParts := make([]promptPart, 0, len(parts))
	hasMultiModal := false
	for _, part := range parts {
		if !part.IsVariable {
			promptParts = append(promptParts, promptPart{
				part: part,
			})

			continue
		}

		tInfo := part.TypeInfo(inputTypes)
		if tInfo == nil || tInfo.Type != vo.DataTypeFile {
			promptParts = append(promptParts, promptPart{
				part: part,
			})
			continue
		}

		promptParts = append(promptParts, promptPart{
			part:     part,
			fileType: tInfo.FileType,
		})

		hasMultiModal = true
	}
	pTpl.parts = promptParts
	pTpl.hasMultiModal = hasMultiModal

	return pTpl
}

const sourceKey = "sources_%s"

func newPrompts(sp, up *promptTpl, model ModelWithInfo) *prompts {
	return &prompts{
		sp:  sp,
		up:  up,
		mwi: model,
	}
}

func newPromptsWithChatHistory(prompts *prompts, cfg *vo.ChatHistorySetting, model ModelWithInfo) *promptsWithChatHistory {
	return &promptsWithChatHistory{
		prompts: prompts,
		cfg:     cfg,
		mwi:     model,
	}
}

func getModelProcessingInfo(ctx context.Context, mwi ModelWithInfo) (*developer_api.ModelAbility, bool) {
	mInfo := mwi.Info(ctx)

	return mInfo.Capability, mInfo.EnableBase64URL
}

func (pl *promptTpl) render(ctx context.Context, vs map[string]any,
	sources map[string]*schema2.SourceInfo,
	supportedModals *developer_api.ModelAbility,
	enableTransferBase64 bool,
) (*schema.Message, error) {
	isChatFlow := execute.GetExeCtx(ctx).ExeCfg.WorkflowMode == workflow.WorkflowMode_ChatFlow
	userMessage := execute.GetExeCtx(ctx).ExeCfg.UserMessage

	if !isChatFlow {
		if !pl.hasMultiModal || !supportedModals.GetSupportMultiModal() {
			var opts []nodes.RenderOption
			if len(pl.reservedKeys) > 0 {
				opts = append(opts, nodes.WithReservedKey(pl.reservedKeys...))
			}
			r, err := nodes.Render(ctx, pl.tpl, vs, sources, opts...)
			if err != nil {
				return nil, err
			}
			return &schema.Message{
				Role:    pl.role,
				Content: r,
			}, nil
		}
	} else {
		if (!pl.hasMultiModal || !supportedModals.GetSupportMultiModal()) &&
			(len(pl.associateUserInputFields) == 0 ||
				(len(pl.associateUserInputFields) > 0 && userMessage != nil && userMessage.MultiContent == nil)) {
			var opts []nodes.RenderOption
			if len(pl.reservedKeys) > 0 {
				opts = append(opts, nodes.WithReservedKey(pl.reservedKeys...))
			}
			r, err := nodes.Render(ctx, pl.tpl, vs, sources, opts...)
			if err != nil {
				return nil, err
			}
			return &schema.Message{
				Role:    pl.role,
				Content: r,
			}, nil
		}

	}

	multiParts := make([]schema.ChatMessagePart, 0, len(pl.parts))
	m, err := sonic.Marshal(vs)
	if err != nil {
		return nil, err
	}

	for _, part := range pl.parts {
		if !part.part.IsVariable {
			multiParts = append(multiParts, schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeText,
				Text: part.part.Value,
			})
			continue
		}

		if _, ok := pl.associateUserInputFields[part.part.Value]; ok && userMessage != nil && isChatFlow {
			for _, p := range userMessage.MultiContent {
				multiParts = append(multiParts, transformMessagePart(p, supportedModals, enableTransferBase64))
			}
			continue
		}

		skipped, invalid := part.part.Skipped(sources)
		if invalid {
			var reserved bool
			for _, k := range pl.reservedKeys {
				if k == part.part.Root {
					reserved = true
					break
				}
			}

			if !reserved {
				continue
			}
		}

		if skipped {
			continue
		}

		r, err := part.part.Render(m)
		if err != nil {
			return nil, err
		}

		if part.fileType == nil {
			multiParts = append(multiParts, schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeText,
				Text: r,
			})
			continue
		}

		var originalPart schema.ChatMessagePart
		switch *part.fileType {
		case vo.FileTypeImage, vo.FileTypeSVG:
			originalPart = schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeImageURL,
				ImageURL: &schema.ChatMessageImageURL{
					URL: r,
				},
			}
		case vo.FileTypeAudio, vo.FileTypeVoice:
			originalPart = schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeAudioURL,
				AudioURL: &schema.ChatMessageAudioURL{
					URL: r,
				},
			}
		case vo.FileTypeVideo:
			originalPart = schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeVideoURL,
				VideoURL: &schema.ChatMessageVideoURL{
					URL: r,
				},
			}
		default:
			originalPart = schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeFileURL,
				FileURL: &schema.ChatMessageFileURL{
					URL: r,
				},
			}
		}
		multiParts = append(multiParts, transformMessagePart(originalPart, supportedModals, enableTransferBase64))
	}

	return &schema.Message{
		Role:         pl.role,
		MultiContent: multiParts,
	}, nil
}

func transformMessagePart(part schema.ChatMessagePart, supportedModals *developer_api.ModelAbility, enableTransferBase64 bool) schema.ChatMessagePart {
	switch part.Type {
	case schema.ChatMessagePartTypeImageURL:
		if !supportedModals.GetImageUnderstanding() {
			return schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeText,
				Text: part.ImageURL.URL,
			}
		}
		if enableTransferBase64 {
			if fileData, err := urltobase64url.URLToBase64(part.ImageURL.URL); err == nil {
				part.ImageURL.MIMEType = fileData.MimeType
				part.ImageURL.URL = fileData.Base64Url
			} else {
				logs.Errorf("transformMessagePart image url to base64 failed, url: %s, err: %v", part.ImageURL.URL, err)
				return part
			}
		}
	case schema.ChatMessagePartTypeAudioURL:
		if !supportedModals.GetAudioUnderstanding() {
			return schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeText,
				Text: part.AudioURL.URL,
			}
		}
		if enableTransferBase64 {
			if fileData, err := urltobase64url.URLToBase64(part.AudioURL.URL); err == nil {
				part.AudioURL.MIMEType = fileData.MimeType
				part.AudioURL.URL = fileData.Base64Url
			} else {
				logs.Errorf("transformMessagePart audio url to base64 failed, url: %s, err: %v", part.AudioURL.URL, err)
				return part
			}
		}
	case schema.ChatMessagePartTypeVideoURL:
		if !supportedModals.GetVideoUnderstanding() {
			return schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeText,
				Text: part.VideoURL.URL,
			}
		}
		if enableTransferBase64 {
			if fileData, err := urltobase64url.URLToBase64(part.VideoURL.URL); err == nil {
				part.VideoURL.MIMEType = fileData.MimeType
				part.VideoURL.URL = fileData.Base64Url
			} else {
				logs.Errorf("transformMessagePart video url to base64 failed, url: %s, err: %v", part.VideoURL.URL, err)
				return part
			}
		}
	case schema.ChatMessagePartTypeFileURL:
		return schema.ChatMessagePart{
			Type: schema.ChatMessagePartTypeText,
			Text: part.FileURL.URL,
		}
		// if enableTransferBase64 {
		// 	if fileData, err := urltobase64url.URLToBase64(part.FileURL.URL); err == nil {
		// 		part.FileURL.MIMEType = fileData.MimeType
		// 		part.FileURL.URL = fileData.Base64Url
		// 	} else {
		// 		logs.Errorf("transformMessagePart file url to base64 failed, url: %s, err: %v", part.FileURL.URL, err)
		// 		return part
		// 	}
		// }
	}
	return part
}

func (p *prompts) Format(ctx context.Context, vs map[string]any, _ ...prompt.Option) (
	_ []*schema.Message, err error,
) {
	exeCtx := execute.GetExeCtx(ctx)
	var nodeKey vo.NodeKey
	if exeCtx != nil && exeCtx.NodeCtx != nil {
		nodeKey = exeCtx.NodeCtx.NodeKey
	}
	sk := fmt.Sprintf(sourceKey, nodeKey)

	sources, ok := ctxcache.Get[map[string]*schema2.SourceInfo](ctx, sk)
	if !ok {
		return nil, fmt.Errorf("resolved sources not found llm node, key: %s", sk)
	}

	supportedModal, enableTransferBase64 := getModelProcessingInfo(ctx, p.mwi)

	var systemMsg, userMsg *schema.Message
	if p.sp != nil {
		systemMsg, err = p.sp.render(ctx, vs, sources, supportedModal, enableTransferBase64)
		if err != nil {
			return nil, err
		}
	}

	if p.up != nil {
		userMsg, err = p.up.render(ctx, vs, sources, supportedModal, enableTransferBase64)
		if err != nil {
			return nil, err
		}
	}

	if userMsg == nil {
		// give it a default empty message.
		// Some model may fail on empty message such as this one.
		userMsg = schema.UserMessage("")
	}

	if systemMsg == nil {
		return []*schema.Message{userMsg}, nil
	}

	return []*schema.Message{systemMsg, userMsg}, nil
}

func (p *promptsWithChatHistory) Format(ctx context.Context, vs map[string]any, _ ...prompt.Option) (
	[]*schema.Message, error) {
	baseMessages, err := p.prompts.Format(ctx, vs)
	if err != nil {
		return nil, err
	}
	if p.cfg == nil || !p.cfg.EnableChatHistory {
		return baseMessages, nil
	}

	exeCtx := execute.GetExeCtx(ctx)
	if exeCtx == nil {
		logs.CtxWarnf(ctx, "execute context is nil, skipping chat history")
		return baseMessages, nil
	}

	if exeCtx.ExeCfg.WorkflowMode != workflow.WorkflowMode_ChatFlow {
		return baseMessages, nil
	}

	historyMessages, ok := ctxcache.Get[[]*schema.Message](ctx, chatHistoryKey)

	if !ok || len(historyMessages) == 0 {
		logs.CtxWarnf(ctx, "conversation history is empty")
		return baseMessages, nil
	}

	if len(historyMessages) == 0 {
		return baseMessages, nil
	}

	supportedModal, enableTransferBase64 := getModelProcessingInfo(ctx, p.mwi)

	for _, msg := range historyMessages {
		for i, part := range msg.MultiContent {
			msg.MultiContent[i] = transformMessagePart(part, supportedModal, enableTransferBase64)
		}
	}

	finalMessages := make([]*schema.Message, 0, len(baseMessages)+len(historyMessages))
	if len(baseMessages) > 0 && baseMessages[0].Role == schema.System {
		finalMessages = append(finalMessages, baseMessages[0])
		baseMessages = baseMessages[1:]
	}
	finalMessages = append(finalMessages, historyMessages...)
	finalMessages = append(finalMessages, baseMessages...)

	return finalMessages, nil
}
