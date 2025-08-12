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

package workflow

import (
	"context"
	"errors"
	"fmt"
	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/contract/conversation"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/contract/message"
	"runtime/debug"
	"strconv"
	"strings"

	"github.com/cloudwego/eino/schema"
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/maps"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

const (
	userRole      = "user"
	assistantRole = "assistant"
	cardTemplate  = `
{
    "elements": {
        "root": {
            "id": "root",
            "name": "Root",
            "type": "@flowpd/cici-components/PageContainer",
            "props": {
                "backgroundColor": "grey",
                "containerPadding": 16,
                "containerRowGap": 12
            },
            "children": [
                "OpfZnYNHby",
                "70zV0Jp5vy"
            ],
            "directives": {

            }
        },
        "OpfZnYNHby": {
            "id": "OpfZnYNHby",
            "name": "FlowpdCiciComponentsColumnLayout",
            "type": "@flowpd/cici-components/ColumnLayout",
            "props": {
                "backgroundColor": "transparent",
                "layoutColumnGap": 4,
                "layoutPaddingGap": 2,
                "borderRadius": 0,
                "enableClickEvent": false,
                "action": "enableUrl",
                "Columns": [
                    {
                        "type": "slot",
                        "children": [
                            "KPa0BqoODo"
                        ],
                        "config": {
                            "width": "weighted",
                            "weight": 1,
                            "vertical": "top",
                            "horizontal": "left",
                            "columnElementGap": 4,
                            "columnElementPadding": 2,
                            "enableClickEvent": false
                        }
                    }
                ]
            },
            "children": [

            ],
            "directives": {
                "repeat": {
                    "type": "expression",
                    "value": "{{5fJt3qKpSz}}",
                    "replaceMap": {
                        "5fJt3qKpSz": "list"
                    }
                }
            }
        },
        "KPa0BqoODo": {
            "id": "KPa0BqoODo",
            "name": "FlowpdCiciComponentsInput",
            "type": "@flowpd/cici-components/Input",
            "props": {
                "enableLabel": true,
                "label": {
                    "type": "expression",
                    "value": "{{item.name}}"
                },
                "placeholder": "Please enter content.",
                "maxLengthEnabled": false,
                "maxLength": 140,
                "required": false,
                "enableSendIcon": true,
                "actionType": "enableMessage",
                "disableAfterAction": true,
                "message": {
                    "type": "expression",
                    "value": "{{KPa0BqoODo_value}}"
                }
            },
            "children": [

            ],
            "directives": {

            }
        },
        "70zV0Jp5vy": {
            "id": "70zV0Jp5vy",
            "name": "FlowpdCiciComponentsColumnLayout",
            "type": "@flowpd/cici-components/ColumnLayout",
            "props": {
                "backgroundColor": "transparent",
                "layoutColumnGap": 4,
                "layoutPaddingGap": 2,
                "borderRadius": 0,
                "enableClickEvent": false,
                "action": "enableUrl",
                "Columns": [
                    {
                        "type": "slot",
                        "children": [
                            "mH5BNaFTl1"
                        ],
                        "config": {
                            "width": "weighted",
                            "weight": 1,
                            "vertical": "top",
                            "horizontal": "right",
                            "columnElementGap": 4,
                            "columnElementPadding": 2,
                            "enableClickEvent": false
                        }
                    }
                ]
            },
            "children": [

            ],
            "directives": {

            }
        },
        "mH5BNaFTl1": {
            "id": "mH5BNaFTl1",
            "name": "FlowpdCiciComponentsButton",
            "type": "@flowpd/cici-components/Button",
            "props": {
                "content": "Button",
                "type": "primary",
                "size": "small",
                "width": "hug",
                "widthPx": 160,
                "textAlign": "center",
                "enableLines": false,
                "lines": 1,
                "positionStyle": {
                    "type": "default"
                },
                "actionType": "enableMessage",
                "disableAfterAction": true,
                "message": {
                    "type": "expression",
                    "value": "{{KPa0BqoODo_value}}"
                }
            },
            "children": [

            ],
            "directives": {

            }
        }
    },
    "rootID": "root",
    "variables": {
        "5fJt3qKpSz": {
            "id": "5fJt3qKpSz",
            "name": "list",
            "defaultValue": [
				
            ]
        }
    },
    "actions": {

    }
}`
)

type inputCard struct {
	Elements  any            `json:"elements"`
	RootID    string         `json:"rootID"`
	Variables map[string]any `json:"variables"`
}

func defaultCard() *inputCard {
	card := &inputCard{}
	_ = sonic.UnmarshalString(cardTemplate, card)
	return card
}

func (w *ApplicationService) CreateApplicationConversationDef(ctx context.Context, req *workflow.CreateProjectConversationDefRequest) (resp *workflow.CreateProjectConversationDefResponse, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrConversationOfAppOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	var (
		spaceID = mustParseInt64(req.GetSpaceID())
		appID   = mustParseInt64(req.GetProjectID())
		userID  = ctxutil.MustGetUIDFromCtx(ctx)
	)

	if err := checkUserSpace(ctx, userID, spaceID); err != nil {
		return nil, err
	}

	uniqueID, err := GetWorkflowDomainSVC().CreateDraftConversationTemplate(ctx, &vo.CreateConversationTemplateMeta{
		AppID:   appID,
		SpaceID: spaceID,
		Name:    req.GetConversationName(),
		UserID:  userID,
	})
	if err != nil {
		return nil, err
	}

	return &workflow.CreateProjectConversationDefResponse{
		UniqueID: strconv.FormatInt(uniqueID, 10),
		SpaceID:  req.GetSpaceID(),
	}, err
}

func (w *ApplicationService) UpdateApplicationConversationDef(ctx context.Context, req *workflow.UpdateProjectConversationDefRequest) (resp *workflow.UpdateProjectConversationDefResponse, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrConversationOfAppOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()
	var (
		spaceID    = mustParseInt64(req.GetSpaceID())
		templateID = mustParseInt64(req.GetUniqueID())
		appID      = mustParseInt64(req.GetProjectID())
		userID     = ctxutil.MustGetUIDFromCtx(ctx)
	)

	if err := checkUserSpace(ctx, userID, spaceID); err != nil {
		return nil, err
	}

	err = GetWorkflowDomainSVC().UpdateDraftConversationTemplateName(ctx, appID, userID, templateID, req.GetConversationName())
	if err != nil {
		return nil, err
	}
	return &workflow.UpdateProjectConversationDefResponse{}, err
}

func (w *ApplicationService) DeleteApplicationConversationDef(ctx context.Context, req *workflow.DeleteProjectConversationDefRequest) (resp *workflow.DeleteProjectConversationDefResponse, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrConversationOfAppOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()
	var (
		appID      = mustParseInt64(req.GetProjectID())
		templateID = mustParseInt64(req.GetUniqueID())
	)
	if err := checkUserSpace(ctx, ctxutil.MustGetUIDFromCtx(ctx), mustParseInt64(req.GetSpaceID())); err != nil {
		return nil, err
	}
	if req.GetCheckOnly() {
		wfs, err := GetWorkflowDomainSVC().CheckWorkflowsToReplace(ctx, appID, templateID)
		if err != nil {
			return nil, err
		}
		resp = &workflow.DeleteProjectConversationDefResponse{NeedReplace: make([]*workflow.Workflow, 0)}
		for _, wf := range wfs {
			resp.NeedReplace = append(resp.NeedReplace, &workflow.Workflow{
				Name:       wf.Name,
				URL:        wf.IconURL,
				WorkflowID: strconv.FormatInt(wf.ID, 10),
			})
		}
		return resp, nil
	}

	wfID2ConversationName, err := maps.TransformKeyWithErrorCheck(req.GetReplace(), func(k1 string) (int64, error) {
		return strconv.ParseInt(k1, 10, 64)
	})

	rowsAffected, err := GetWorkflowDomainSVC().DeleteDraftConversationTemplate(ctx, templateID, wfID2ConversationName)
	if err != nil {
		return nil, err
	}
	if rowsAffected > 0 {
		return &workflow.DeleteProjectConversationDefResponse{
			Success: true,
		}, err
	}

	rowsAffected, err = GetWorkflowDomainSVC().DeleteDynamicConversation(ctx, vo.Draft, templateID)
	if err != nil {
		return nil, err
	}

	if rowsAffected == 0 {
		return nil, fmt.Errorf("delete conversation failed")
	}

	return &workflow.DeleteProjectConversationDefResponse{
		Success: true,
	}, nil

}

func (w *ApplicationService) ListApplicationConversationDef(ctx context.Context, req *workflow.ListProjectConversationRequest) (resp *workflow.ListProjectConversationResponse, err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrConversationOfAppOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()
	var connectorID int64
	if len(req.GetConnectorID()) != 0 {
		connectorID = mustParseInt64(req.GetConnectorID())
	} else {
		connectorID = consts.CozeConnectorID
	}
	var (
		page                 = mustParseInt64(ternary.IFElse(req.GetCursor() == "", "0", req.GetCursor()))
		size                 = req.GetLimit()
		userID               = ctxutil.MustGetUIDFromCtx(ctx)
		spaceID              = mustParseInt64(req.GetSpaceID())
		appID                = mustParseInt64(req.GetProjectID())
		version              = req.ProjectVersion
		listConversationMeta = vo.ListConversationMeta{
			APPID:       appID,
			UserID:      userID,
			ConnectorID: connectorID,
		}
	)

	if err := checkUserSpace(ctx, userID, spaceID); err != nil {
		return nil, err
	}

	env := ternary.IFElse(req.GetCreateEnv() == workflow.CreateEnv_Draft, vo.Draft, vo.Online)
	if req.GetCreateMethod() == workflow.CreateMethod_ManualCreate {
		templates, err := GetWorkflowDomainSVC().ListConversationTemplate(ctx, env, &vo.ListConversationTemplatePolicy{
			AppID: appID,
			Page: &vo.Page{
				Page: int32(page),
				Size: int32(size),
			},
			NameLike: ternary.IFElse(len(req.GetNameLike()) == 0, nil, ptr.Of(req.GetNameLike())),
			Version:  version,
		})
		if err != nil {
			return nil, err
		}

		stsConversations, err := GetWorkflowDomainSVC().MGetStaticConversation(ctx, env, userID, connectorID, slices.Transform(templates, func(a *entity.ConversationTemplate) int64 {
			return a.TemplateID
		}))
		if err != nil {
			return nil, err
		}
		stsConversationMap := slices.ToMap(stsConversations, func(e *entity.StaticConversation) (int64, *entity.StaticConversation) {
			return e.TemplateID, e
		})

		resp = &workflow.ListProjectConversationResponse{Data: make([]*workflow.ProjectConversation, 0)}
		for _, tmpl := range templates {
			conversationID := ""
			if c, ok := stsConversationMap[tmpl.TemplateID]; ok {
				conversationID = strconv.FormatInt(c.ConversationID, 10)
			}
			resp.Data = append(resp.Data, &workflow.ProjectConversation{
				UniqueID:         strconv.FormatInt(tmpl.TemplateID, 10),
				ConversationName: tmpl.Name,
				ConversationID:   conversationID,
			})
		}
	}

	if req.GetCreateMethod() == workflow.CreateMethod_NodeCreate {
		dyConversations, err := GetWorkflowDomainSVC().ListDynamicConversation(ctx, env, &vo.ListConversationPolicy{
			ListConversationMeta: listConversationMeta,
			Page: &vo.Page{
				Page: int32(page),
				Size: int32(size),
			},
			NameLike: ternary.IFElse(len(req.GetNameLike()) == 0, nil, ptr.Of(req.GetNameLike())),
		})
		if err != nil {
			return nil, err
		}
		resp = &workflow.ListProjectConversationResponse{Data: make([]*workflow.ProjectConversation, 0, len(dyConversations))}
		resp.Data = append(resp.Data, slices.Transform(dyConversations, func(a *entity.DynamicConversation) *workflow.ProjectConversation {
			return &workflow.ProjectConversation{
				UniqueID:         strconv.FormatInt(a.ID, 10),
				ConversationName: a.Name,
				ConversationID:   strconv.FormatInt(a.ConversationID, 10),
			}
		})...)

	}

	return resp, nil
}

func (w *ApplicationService) OpenAPIChatFlowRun(ctx context.Context, req *workflow.ChatFlowRunRequest) (
	_ *schema.StreamReader[[]*workflow.ChatFlowRunResponse], err error) {
	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}

		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrChatFlowRoleOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	if len(req.GetAdditionalMessages()) == 0 {
		return nil, fmt.Errorf("additional_messages is requird")
	}

	messages := req.GetAdditionalMessages()

	lastUserMessage := messages[len(req.GetAdditionalMessages())-1]
	if lastUserMessage.Role != userRole {
		return nil, errors.New("the role of the last day message must be user")
	}

	var parameters = make(map[string]any)
	if len(req.GetParameters()) > 0 {
		err := sonic.UnmarshalString(req.GetParameters(), parameters)
		if err != nil {
			return nil, err
		}
	}

	var (
		isDebug        = req.GetExecuteMode() == "DEBUG"
		appID, agentID *int64
		resolveAppID   int64
		conversationID int64
		version        string
		locator        vo.Locator
		apiKeyInfo     = ctxutil.GetApiAuthFromCtx(ctx)
		userID         = apiKeyInfo.UserID
		connectorID    = apiKeyInfo.ConnectorID
	)
	if req.IsSetAppID() {
		appID = ptr.Of(mustParseInt64(req.GetAppID()))
		resolveAppID = mustParseInt64(req.GetAppID())
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
		resolveAppID = mustParseInt64(req.GetBotID())
	}

	if appID != nil && agentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	if isDebug {
		locator = vo.FromDraft
	} else {
		meta, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
			ID:       mustParseInt64(req.GetWorkflowID()),
			MetaOnly: true,
		})
		if err != nil {
			return nil, err
		}

		if meta.LatestPublishedVersion == nil {
			return nil, vo.NewError(errno.ErrWorkflowNotPublished)
		}
		if req.IsSetVersion() {
			version = req.GetVersion()
			locator = vo.FromSpecificVersion
		} else {
			version = meta.GetLatestVersion()
			locator = vo.FromLatestVersion
		}
	}

	if req.IsSetConversationID() {
		conversationID = mustParseInt64(req.GetConversationID())
	} else {
		conversationName, ok := parameters["CONVERSATION_NAME"].(string)
		if !ok {
			return nil, fmt.Errorf("conversation name is requried")
		}
		cID, err := GetWorkflowDomainSVC().GetOrCreateConversation(ctx, ternary.IFElse(isDebug, vo.Draft, vo.Online), resolveAppID, connectorID, userID, conversationName)
		if err != nil {
			return nil, err
		}
		conversationID = cID
	}

	roundID, err := w.IDGenerator.GenID(ctx)
	if err != nil {
		return nil, vo.WrapError(errno.ErrIDGenError, err)
	}

	userMessage, err := toConversationMessage(ctx, resolveAppID, conversationID, userID, roundID, message.MessageTypeQuestion, lastUserMessage)
	if err != nil {
		return nil, err
	}

	messageClient := crossmessage.DefaultSVC()
	_, err = messageClient.Create(ctx, userMessage)
	if err != nil {
		return nil, err
	}

	info, existed, unbinding, err := GetWorkflowDomainSVC().GetConvRelatedInfo(ctx, conversationID)
	if err != nil {
		return nil, err
	}

	if existed {
		var data = lastUserMessage.Content
		if info.NodeType == entity.NodeTypeInputReceiver {
			data = parserInput(lastUserMessage.Content)
		}
		sr, err := GetWorkflowDomainSVC().StreamResume(ctx, &entity.ResumeRequest{
			EventID:    info.EventID,
			ExecuteID:  info.ExecID,
			ResumeData: data,
		}, vo.ExecuteConfig{
			Operator:       userID,
			Mode:           ternary.IFElse(isDebug, vo.ExecuteModeDebug, vo.ExecuteModeRelease),
			ConnectorID:    connectorID,
			ConnectorUID:   strconv.FormatInt(userID, 10),
			BizType:        vo.BizTypeWorkflow,
			AppID:          appID,
			AgentID:        agentID,
			ConversationID: ptr.Of(conversationID),
			RoundID:        ptr.Of(roundID),
		})
		if err != nil {
			uErr := unbinding()
			if uErr != nil {
				return nil, uErr
			}
			return nil, err
		}

		return schema.StreamReaderWithConvert(sr, convertToChatFlowRunResponseList(ctx, convertToChatFlowInfo{
			appID:          resolveAppID,
			conversationID: conversationID,
			roundID:        roundID,
			workflowID:     mustParseInt64(req.GetWorkflowID()),
			unbinding:      unbinding,
		})), nil

	}

	historyMessages, err := w.makeChatFlowHistoryMessages(ctx, resolveAppID, conversationID, userID, messages[:len(req.GetAdditionalMessages())-1])
	if err != nil {
		return nil, err
	}

	if len(historyMessages) > 0 {
		g := taskgroup.NewTaskGroup(ctx, len(historyMessages))
		for _, hm := range historyMessages {
			hMsg := hm
			g.Go(func() error {
				_, err := messageClient.Create(ctx, hMsg)
				if err != nil {
					return err
				}
				return nil
			})
		}
		err = g.Wait()
		if err != nil {
			logs.CtxWarnf(ctx, "create history message failed, err=%v", err)
		}
	}

	userSchemaMessage, err := w.toSchemaMessage(ctx, lastUserMessage)
	if err != nil {
		return nil, err
	}

	exeCfg := vo.ExecuteConfig{
		ID:             mustParseInt64(req.GetWorkflowID()),
		From:           locator,
		Version:        version,
		Operator:       userID,
		Mode:           ternary.IFElse(isDebug, vo.ExecuteModeDebug, vo.ExecuteModeRelease),
		AppID:          appID,
		AgentID:        agentID,
		ConnectorID:    connectorID,
		ConnectorUID:   strconv.FormatInt(userID, 10),
		TaskType:       vo.TaskTypeForeground,
		SyncPattern:    vo.SyncPatternStream,
		InputFailFast:  true,
		BizType:        vo.BizTypeWorkflow,
		ConversationID: ptr.Of(conversationID),
		RoundID:        ptr.Of(roundID),
		UserMessage:    userSchemaMessage,
		Cancellable:    isDebug == true,
	}

	parameters["USER_INPUT"], err = w.makeChatFlowUserInput(ctx, lastUserMessage)
	if err != nil {
		return nil, err
	}

	sr, err := GetWorkflowDomainSVC().StreamExecute(ctx, exeCfg, parameters)
	if err != nil {
		return nil, err
	}

	return schema.StreamReaderWithConvert(sr, convertToChatFlowRunResponseList(ctx, convertToChatFlowInfo{
		appID:          resolveAppID,
		conversationID: conversationID,
		roundID:        roundID,
		workflowID:     mustParseInt64(req.GetWorkflowID()),
		unbinding:      unbinding,
	})), nil

}

func (w *ApplicationService) makeChatFlowUserInput(ctx context.Context, message *workflow.EnterMessage) (string, error) {
	type content struct {
		Type   string  `json:"type,omitempty"`
		FileID *string `json:"file_id"`
		Text   *string `json:"text"`
	}
	if message.ContentType == "text" {
		return message.Content, nil
	} else if message.ContentType == "object_string" {
		contents := make([]content, 0)
		err := sonic.UnmarshalString(message.Content, &contents)
		if err != nil {
			return "", err
		}
		texts := make([]string, 0)
		urls := make([]string, 0)
		for _, ct := range contents {
			if ct.Text != nil && len(*ct.Text) > 0 {
				texts = append(texts, *ct.Text)
			}
			if ct.FileID != nil && len(*ct.FileID) > 0 {
				u, err := w.ImageX.GetResourceURL(ctx, *ct.FileID)
				if err != nil {
					return "", err
				}
				urls = append(urls, u.URL)
			}
		}

		return strings.Join(texts, ",") + strings.Join(urls, ","), nil

	} else {
		return "", fmt.Errorf("invalid message ccontent type %v", message.ContentType)
	}

}
func (w *ApplicationService) makeChatFlowHistoryMessages(ctx context.Context, appID, conversationID int64, userID int64, messages []*workflow.EnterMessage) ([]*message.Message, error) {

	var (
		rID int64
		err error
	)

	historyMessages := make([]*message.Message, 0, len(messages))

	for _, msg := range messages {
		if msg.Role == userRole {
			rID, err = w.IDGenerator.GenID(ctx)
			if err != nil {
				return nil, err
			}
		} else if msg.Role == assistantRole && rID == 0 {
			continue
		} else {
			return nil, fmt.Errorf("invalid role type %v", msg.Role)
		}

		m, err := toConversationMessage(ctx, appID, conversationID, userID, rID, ternary.IFElse(msg.Role == userRole, message.MessageTypeQuestion, message.MessageTypeAnswer), msg)
		if err != nil {
			return nil, err
		}

		historyMessages = append(historyMessages, m)

	}
	return historyMessages, nil
}

func (w *ApplicationService) OpenAPICreateConversation(ctx context.Context, req *workflow.CreateConversationRequest) (resp *workflow.CreateConversationResponse, err error) {

	defer func() {
		if panicErr := recover(); panicErr != nil {
			err = safego.NewPanicErr(panicErr, debug.Stack())
		}
		if err != nil {
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
		}
	}()

	var (
		appID      = mustParseInt64(req.GetAppID())
		apiKeyInfo = ctxutil.GetApiAuthFromCtx(ctx)
		userID     = apiKeyInfo.UserID
		env        = ternary.IFElse(req.GetDraftMode(), vo.Draft, vo.Online)
		cID        int64
		//spaceID = mustParseInt64(req.GetSpaceID())
		//_       = spaceID
	)

	// todo  check permission

	if !req.GetGetOrCreate() {
		cID, err = GetWorkflowDomainSVC().UpdateConversation(ctx, env, appID, req.GetConnectorId(), userID, req.GetConversationMame())
	} else {
		cID, err = GetWorkflowDomainSVC().GetOrCreateConversation(ctx, env, appID, req.GetConnectorId(), userID, req.GetConversationMame())
	}
	if err != nil {
		return nil, err
	}

	cInfo, err := crossconversation.DefaultSVC().GetByID(ctx, cID)
	if err != nil {
		return nil, err
	}

	return &workflow.CreateConversationResponse{
		ConversationData: &workflow.ConversationData{
			Id:            cID,
			LastSectionID: ptr.Of(cInfo.SectionID),
		},
	}, nil
}

func toConversationMessage(_ context.Context, appID int64, cid int64, userID int64, roundID int64, messageType message.MessageType, msg *workflow.EnterMessage) (*message.Message, error) {
	type content struct {
		Type   string  `json:"type"`
		FileID *string `json:"file_id"`
		Text   *string `json:"text"`
	}
	if msg.ContentType == "text" {
		return &message.Message{
			Role:           schema.User,
			ConversationID: cid,
			AgentID:        appID,
			RunID:          roundID,
			Content:        msg.Content,
			ContentType:    message.ContentTypeText,
			MessageType:    messageType,
			UserID:         strconv.FormatInt(userID, 10),
		}, nil

	} else if msg.ContentType == "object_string" {
		contents := make([]*content, 0)
		err := sonic.UnmarshalString(msg.Content, &contents)
		if err != nil {
			return nil, err
		}

		m := &message.Message{
			Role:           schema.User,
			MessageType:    messageType,
			ConversationID: cid,
			UserID:         strconv.FormatInt(userID, 10),
			RunID:          roundID,
			Content:        msg.Content,
			ContentType:    message.ContentTypeMix,
			MultiContent:   make([]*message.InputMetaData, 0, len(contents)),
		}

		for _, ct := range contents {
			if ct.Text != nil {
				m.MultiContent = append(m.MultiContent, &message.InputMetaData{
					Type: message.InputTypeText,
					Text: *ct.Text,
				})
			} else if ct.FileID != nil {
				m.MultiContent = append(m.MultiContent, &message.InputMetaData{
					Type: message.InputType(ct.Type),
					FileData: []*message.FileData{
						{Url: *ct.FileID},
					},
				})
			} else {
				return nil, fmt.Errorf("invalid input type %v", ct.Type)
			}
		}
		return m, nil
	} else {
		return nil, fmt.Errorf("invalid message content type %v", msg.ContentType)
	}
}

func (w *ApplicationService) toSchemaMessage(ctx context.Context, msg *workflow.EnterMessage) (*schema.Message, error) {
	type content struct {
		Type   string  `json:"type"`
		FileID *string `json:"file_id"`
		Text   *string `json:"text"`
	}
	if msg.ContentType == "text" {
		return &schema.Message{
			Role:    schema.User,
			Content: msg.Content,
		}, nil

	} else if msg.ContentType == "object_string" {
		contents := make([]*content, 0)
		err := sonic.UnmarshalString(msg.Content, &contents)
		if err != nil {
			return nil, err
		}
		m := &schema.Message{
			Role:         schema.User,
			MultiContent: make([]schema.ChatMessagePart, 0, len(contents)),
		}

		for _, ct := range contents {
			if ct.Text != nil {
				m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: *ct.Text,
				})
			} else if ct.FileID != nil {
				uri := *ct.FileID
				u, err := w.ImageX.GetResourceURL(ctx, uri)
				if err != nil {
					return nil, err
				}
				switch ct.Type {
				case "file":
					m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URL: u.URL,
						},
					})
				case "image":
					m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: u.URL,
						},
					})
				case "audio":
					m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URL: u.URL,
						},
					})
				case "video":
					m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URL: u.URL,
						},
					})
				}

			} else {
				return nil, fmt.Errorf("invalid input type %v", ct.Type)
			}
		}
		return m, nil
	} else {
		return nil, fmt.Errorf("invalid message content type %v", msg.ContentType)
	}
}

type convertToChatFlowInfo struct {
	appID          int64
	conversationID int64
	roundID        int64
	workflowID     int64
	unbinding      func() error
}

func parserInput(inputString string) string {
	result := map[string]any{}
	lines := strings.Split(inputString, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		keyValue := strings.SplitN(line, ":", 2)
		if len(keyValue) == 2 {
			result[keyValue[0]] = keyValue[1]
		}
	}
	str, _ := sonic.MarshalString(result)

	return str

}

func convertToChatFlowRunResponseList(ctx context.Context, info convertToChatFlowInfo) func(msg *entity.Message) (responses []*workflow.ChatFlowRunResponse, err error) {
	var (
		appID          = info.appID
		conversationID = info.conversationID
		roundID        = info.roundID
		workflowID     = info.workflowID
		unbinding      = info.unbinding

		spaceID   int64
		executeID int64

		hasFirstMessage = false
		messageOutput   string
		messageID       int64
		outputCount     int32
		inputCount      int32
	)
	var createOrUpdateMessage = func(msg string, role schema.RoleType, contentType message.ContentType) error {
		entityMessage := &message.Message{
			AgentID:        appID,
			RunID:          roundID,
			Content:        msg,
			ConversationID: conversationID,
			ContentType:    contentType,
			Role:           role,
			MessageType:    message.MessageTypeAnswer,
		}
		if hasFirstMessage {
			entityMessage.ID = messageID
			_, err := crossmessage.DefaultSVC().Edit(ctx, entityMessage)
			if err != nil {
				return err
			}
		} else {
			m, err := crossmessage.DefaultSVC().Create(ctx, entityMessage)
			if err != nil {
				return err
			}
			messageID = m.ID
			hasFirstMessage = true
		}
		return nil

	}

	return func(msg *entity.Message) (responses []*workflow.ChatFlowRunResponse, err error) {
		if msg.StateMessage != nil {
			if executeID > 0 && executeID != msg.StateMessage.ExecuteID {
				return nil, schema.ErrNoValue
			}
			switch msg.StateMessage.Status {
			case entity.WorkflowSuccess:
				chatDoneEvent := &vo.ChatFlowDetail{
					ID:             strconv.FormatInt(roundID, 10),
					ConversationID: strconv.FormatInt(conversationID, 10),
					BotID:          strconv.FormatInt(appID, 10),
					Status:         vo.Completed,
					ExecuteID:      strconv.FormatInt(executeID, 10),
					Usage: &vo.Usage{
						InputTokens:  ptr.Of(inputCount),
						OutputTokens: ptr.Of(outputCount),
						TokenCount:   ptr.Of(outputCount + inputCount),
					},
				}
				data, err := sonic.MarshalString(chatDoneEvent)
				if err != nil {
					return nil, err
				}

				doneData, err := sonic.MarshalString(map[string]interface{}{
					"debug_url": fmt.Sprintf(vo.DebugURLTpl, executeID, spaceID, workflowID),
				})
				if err != nil {
					return nil, err
				}
				if unbinding != nil {
					uErr := unbinding()
					if uErr != nil {
						return nil, uErr
					}
				}
				return []*workflow.ChatFlowRunResponse{
					{
						Event: string(vo.ChatFlowCompleted),
						Data:  data,
					},
					{
						Event: string(vo.ChatFlowDone),
						Data:  doneData,
					},
				}, err
			case entity.WorkflowFailed:
				var wfe vo.WorkflowError
				if !errors.As(msg.StateMessage.LastError, &wfe) {
					panic("stream run last error is not a WorkflowError")
				}

				chatFailedEvent := &vo.ErrorDetail{
					Code:     strconv.Itoa(int(wfe.Code())),
					Msg:      wfe.Msg(),
					DebugUrl: wfe.DebugURL(),
				}
				data, err := sonic.MarshalString(chatFailedEvent)
				if err != nil {
					return nil, err
				}

				if unbinding() != nil {
					uErr := unbinding()
					if uErr != nil {
						return nil, uErr
					}
				}

				return []*workflow.ChatFlowRunResponse{
					{
						Event: string(vo.ChatFlowError),
						Data:  data,
					},
				}, err

			case entity.WorkflowCancel:
				if unbinding() != nil {
					uErr := unbinding()
					if uErr != nil {
						return nil, uErr
					}
				}

			case entity.WorkflowInterrupted:
				chatEvent := &vo.ChatFlowDetail{
					ID:             strconv.FormatInt(roundID, 10),
					ConversationID: strconv.FormatInt(conversationID, 10),
					Status:         vo.RequiresAction,
					ExecuteID:      strconv.FormatInt(executeID, 10),
				}
				data, err := sonic.MarshalString(chatEvent)
				if err != nil {
					return nil, err
				}

				doneData, err := sonic.MarshalString(map[string]interface{}{
					"debug_url": fmt.Sprintf(vo.DebugURLTpl, executeID, spaceID, workflowID),
				})
				if err != nil {
					return nil, err
				}

				responses = append(responses, &workflow.ChatFlowRunResponse{
					Event: string(vo.ChatFlowRequiresAction),
					Data:  data,
				})

				responses = append(responses, &workflow.ChatFlowRunResponse{
					Event: string(vo.ChatFlowDone),
					Data:  doneData,
				})
				err = GetWorkflowDomainSVC().BindConvRelatedInfo(ctx, conversationID, entity.ConvRelatedInfo{
					EventID: msg.StateMessage.InterruptEvent.ID, ExecID: executeID, NodeType: msg.StateMessage.InterruptEvent.NodeType,
				})
				if err != nil {
					return nil, err
				}

				return responses, nil

			case entity.WorkflowRunning:
				executeID = msg.StateMessage.ExecuteID
				spaceID = msg.StateMessage.SpaceID

				responses = make([]*workflow.ChatFlowRunResponse, 0)
				chatEvent := &vo.ChatFlowDetail{
					ID:             strconv.FormatInt(roundID, 10),
					ConversationID: strconv.FormatInt(conversationID, 10),
					Status:         vo.Created,
					ExecuteID:      strconv.FormatInt(executeID, 10),
				}
				data, err := sonic.MarshalString(chatEvent)
				if err != nil {
					return nil, err
				}
				responses = append(responses, &workflow.ChatFlowRunResponse{
					Event: string(vo.ChatFlowCreated),
					Data:  data,
				})

				chatEvent.Status = vo.InProgress
				data, err = sonic.MarshalString(chatEvent)
				if err != nil {
					return nil, err
				}

				responses = append(responses, &workflow.ChatFlowRunResponse{
					Event: string(vo.ChatFlowInProgress),
					Data:  data,
				})
				return responses, nil

			default:
				return nil, schema.ErrNoValue
			}
		}
		if msg.DataMessage != nil {
			if msg.Type != entity.Answer {
				return nil, schema.ErrNoValue
			}
			// stream run will skip all messages from workflow tools
			if executeID > 0 && executeID != msg.DataMessage.ExecuteID {
				return nil, schema.ErrNoValue
			}

			dataMessage := msg.DataMessage
			if dataMessage.Usage != nil {
				inputCount += int32(msg.DataMessage.Usage.InputTokens)
				outputCount += int32(msg.DataMessage.Usage.OutputTokens)
			}

			var (
				contentType  message.ContentType
				messageEvent = &vo.MessageDetail{
					ChatID:         strconv.FormatInt(roundID, 10),
					ConversationID: strconv.FormatInt(conversationID, 10),
					BotID:          strconv.FormatInt(appID, 10),
					Role:           string(dataMessage.Role),
					Type:           string(dataMessage.Type),
				}
			)
			switch msg.DataMessage.NodeType {
			case entity.NodeTypeInputReceiver:
				msg.Content, err = renderInputCardDSL(msg.Content)
				if err != nil {
					return nil, err
				}
				messageEvent.Content = msg.Content
				messageEvent.ContentType = string(message.ContentTypeCard)
				contentType = message.ContentTypeCard
			case entity.NodeTypeQuestionAnswer:
				msg.Content, err = renderSelectOptionCardDSL(msg.Content)
				if err != nil {
					return nil, err
				}
				messageEvent.Content = msg.Content
				messageEvent.ContentType = string(message.ContentTypeCard)
				contentType = message.ContentTypeCard
			default:
				contentType = message.ContentTypeText
				messageEvent.Content = msg.Content
				messageEvent.ContentType = string(message.ContentTypeText)
			}

			messageOutput += msg.Content
			err = createOrUpdateMessage(messageOutput, dataMessage.Role, contentType)
			if err != nil {
				return nil, err
			}

			messageEvent.ID = strconv.FormatInt(messageID, 10)
			data, err := sonic.MarshalString(messageEvent)
			if err != nil {
				return nil, err
			}

			return []*workflow.ChatFlowRunResponse{
				{
					Event: ternary.IFElse(msg.Last, string(vo.ChatFlowMessageCompleted), string(vo.ChatFlowMessageDelta)),
					Data:  data,
				},
			}, nil

		}

		return nil, err
	}
}

func renderInputCardDSL(c string) (string, error) {
	type contentInfo struct {
		Content string `json:"content"`
	}
	type field struct {
		Type     string `json:"type"`
		Name     string `json:"name"`
		Required bool   `json:"required"`
	}
	type inputCard struct {
		CardType     int64             `json:"card_type"`
		ContentType  int64             `json:"content_type"`
		ResponseType string            `json:"response_type"`
		TemplateId   int64             `json:"template_id"`
		TemplateURL  string            `json:"template_url"`
		Data         string            `json:"data"`
		XProperties  map[string]string `json:"x_properties"`
	}

	info := &contentInfo{}
	err := sonic.UnmarshalString(c, info)
	if err != nil {
		return "", err
	}

	fields := make([]*field, 0)
	_ = sonic.UnmarshalString(info.Content, &fields)
	iCard := defaultCard()
	iCard.Variables["5fJt3qKpSz"].(map[string]any)["defaultValue"] = fields
	iCardString, _ := sonic.MarshalString(iCard)

	rCard := &inputCard{
		CardType:     3,
		ContentType:  50,
		ResponseType: "card",
		TemplateId:   7383997384420262000,
		TemplateURL:  "",
		Data:         iCardString,
	}

	type props struct {
		CardType      string   `json:"card_type"`
		InputCardData []*field `json:"input_card_data"`
	}

	propsString, _ := sonic.MarshalString(props{
		CardType:      "INPUT",
		InputCardData: fields,
	})

	rCard.XProperties = map[string]string{
		"workflow_card_info": propsString,
	}
	rCardString, _ := sonic.MarshalString(rCard)

	return rCardString, nil

}

func renderSelectOptionCardDSL(c string) (string, error) {
	type contentInfo struct {
		Messages []struct {
			Content struct {
				Options []struct {
					Name string `json:"name"`
				} `json:"options"`
			} `json:"content"`
		} `json:"messages"`
		Question string `json:"question"`
	}

	type field struct {
		Name string `json:"name"`
	}
	type key struct {
		Key string `json:"key"`
	}

	type inputCard struct {
		CardType     int64             `json:"card_type"`
		ContentType  int64             `json:"content_type"`
		ResponseType string            `json:"response_type"`
		TemplateId   int64             `json:"template_id"`
		TemplateURL  string            `json:"template_url"`
		Data         string            `json:"data"`
		XProperties  map[string]string `json:"x_properties"`
	}

	info := &contentInfo{}
	err := sonic.UnmarshalString(c, info)
	if err != nil {
		return "", err
	}

	iCard := defaultCard()

	keys := make([]*key, 0)
	fields := make([]*field, 0)
	for _, msg := range info.Messages {
		for _, op := range msg.Content.Options {
			keys = append(keys, &key{Key: op.Name})
			fields = append(fields, &field{Name: op.Name})
		}
	}

	iCard.Variables["5fJt3qKpSz"].(map[string]any)["defaultValue"] = map[string]any{
		"description": info.Question,
		"list":        keys,
	}
	iCardString, _ := sonic.MarshalString(iCard)

	rCard := &inputCard{
		CardType:     3,
		ContentType:  50,
		ResponseType: "card",
		TemplateId:   7383997384420262000,
		TemplateURL:  "",
		Data:         iCardString,
	}

	type props struct {
		CardType         string `json:"card_type"`
		QuestionCardData struct {
			Title   string   `json:"Title"`
			Options []*field `json:"Options"`
		} `json:"question_card_data"`
	}

	propsString, _ := sonic.MarshalString(props{
		CardType: "QUESTION",
		QuestionCardData: struct {
			Title   string   `json:"Title"`
			Options []*field `json:"Options"`
		}{Title: info.Question, Options: fields},
	})

	rCard.XProperties = map[string]string{
		"workflow_card_info": propsString,
	}
	rCardString, _ := sonic.MarshalString(rCard)

	return rCardString, nil

}
