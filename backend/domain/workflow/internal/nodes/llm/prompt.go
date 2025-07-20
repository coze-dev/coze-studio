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

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

type prompts struct {
	sp  *promptTpl
	up  *promptTpl
	mwi ModelWithInfo
}

type promptTpl struct {
	role          schema.RoleType
	tpl           string
	parts         []promptPart
	hasMultiModal bool
	reservedKeys  []string
}

type promptPart struct {
	part     nodes.TemplatePart
	fileType *vo.FileSubType
}

func newPromptTpl(role schema.RoleType,
	tpl string,
	inputTypes map[string]*vo.TypeInfo,
	reservedKeys []string,
) *promptTpl {
	if len(tpl) == 0 {
		return nil
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

	return &promptTpl{
		role:          role,
		tpl:           tpl,
		parts:         promptParts,
		hasMultiModal: hasMultiModal,
		reservedKeys:  reservedKeys,
	}
}

const sourceKey = "sources_%s"

func newPrompts(sp, up *promptTpl, model ModelWithInfo) *prompts {
	return &prompts{
		sp:  sp,
		up:  up,
		mwi: model,
	}
}

func (pl *promptTpl) render(ctx context.Context, vs map[string]any,
	sources map[string]*nodes.SourceInfo,
	supportedModals map[modelmgr.Modal]bool) (*schema.Message, error) {
	if !pl.hasMultiModal || len(supportedModals) == 0 {
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

		switch *part.fileType {
		case vo.FileTypeImage, vo.FileTypeSVG:
			if _, ok := supportedModals[modelmgr.ModalImage]; !ok {
				multiParts = append(multiParts, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: r,
				})
			} else {
				multiParts = append(multiParts, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeImageURL,
					ImageURL: &schema.ChatMessageImageURL{
						URL: r,
					},
				})
			}
		case vo.FileTypeAudio, vo.FileTypeVoice:
			if _, ok := supportedModals[modelmgr.ModalAudio]; !ok {
				multiParts = append(multiParts, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: r,
				})
			} else {
				multiParts = append(multiParts, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeAudioURL,
					AudioURL: &schema.ChatMessageAudioURL{
						URL: r,
					},
				})
			}
		case vo.FileTypeVideo:
			if _, ok := supportedModals[modelmgr.ModalVideo]; !ok {
				multiParts = append(multiParts, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: r,
				})
			} else {
				multiParts = append(multiParts, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeVideoURL,
					VideoURL: &schema.ChatMessageVideoURL{
						URL: r,
					},
				})
			}
		default:
			if _, ok := supportedModals[modelmgr.ModalFile]; !ok {
				multiParts = append(multiParts, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: r,
				})
			} else {
				multiParts = append(multiParts, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeFileURL,
					FileURL: &schema.ChatMessageFileURL{
						URL: r,
					},
				})
			}
		}
	}

	return &schema.Message{
		Role:         pl.role,
		MultiContent: multiParts,
	}, nil
}

func (p *prompts) Format(ctx context.Context, vs map[string]any, _ ...prompt.Option) (
	_ []*schema.Message, err error) {
	exeCtx := execute.GetExeCtx(ctx)
	var nodeKey vo.NodeKey
	if exeCtx != nil && exeCtx.NodeCtx != nil {
		nodeKey = exeCtx.NodeCtx.NodeKey
	}
	sk := fmt.Sprintf(sourceKey, nodeKey)

	sources, ok := ctxcache.Get[map[string]*nodes.SourceInfo](ctx, sk)
	if !ok {
		return nil, fmt.Errorf("resolved sources not found llm node, key: %s", sk)
	}

	supportedModal := map[modelmgr.Modal]bool{}
	mInfo := p.mwi.Info(ctx)
	if mInfo != nil {
		for i := range mInfo.Meta.Capability.InputModal {
			supportedModal[mInfo.Meta.Capability.InputModal[i]] = true
		}
	}

	var systemMsg, userMsg *schema.Message
	if p.sp != nil {
		systemMsg, err = p.sp.render(ctx, vs, sources, supportedModal)
		if err != nil {
			return nil, err
		}
	}

	if p.up != nil {
		userMsg, err = p.up.render(ctx, vs, sources, supportedModal)
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
