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
	"runtime/debug"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	crossagentrun "github.com/coze-dev/coze-studio/backend/crossdomain/agentrun"
	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/conversation"
	crossmessage "github.com/coze-dev/coze-studio/backend/crossdomain/message"
	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	crossupload "github.com/coze-dev/coze-studio/backend/crossdomain/upload"
	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	agententity "github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/upload/service"
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
			err = vo.WrapIfNeeded(errno.ErrWorkflowOperationFail, err, errorx.KV("cause", vo.UnwrapRootErr(err).Error()))
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
		err := sonic.UnmarshalString(req.GetParameters(), &parameters)
		if err != nil {
			return nil, err
		}
	}

	var (
		workflowID     = mustParseInt64(req.GetWorkflowID())
		isDebug        = req.GetExecuteMode() == "DEBUG"
		appID, agentID *int64
		bizID          int64
		conversationID int64
		sectionID      int64
		version        string
		locator        workflowModel.Locator
		apiKeyInfo     = ctxutil.GetApiAuthFromCtx(ctx)
		userID         = apiKeyInfo.UserID
		connectorID    int64
	)
	if len(req.GetConnectorID()) == 0 {
		connectorID = ternary.IFElse(isDebug, consts.CozeConnectorID, apiKeyInfo.ConnectorID)
	} else {
		connectorID = mustParseInt64(req.GetConnectorID())
	}

	if req.IsSetAppID() {
		appID = ptr.Of(mustParseInt64(req.GetAppID()))
		bizID = mustParseInt64(req.GetAppID())
	}
	if req.IsSetBotID() {
		agentID = ptr.Of(mustParseInt64(req.GetBotID()))
		bizID = mustParseInt64(req.GetBotID())
	}

	if appID != nil && agentID != nil {
		return nil, errors.New("project_id and bot_id cannot be set at the same time")
	}

	if isDebug {
		locator = workflowModel.FromDraft
	} else {
		meta, err := GetWorkflowDomainSVC().Get(ctx, &vo.GetPolicy{
			ID:       workflowID,
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
			locator = workflowModel.FromSpecificVersion
		} else {
			version = meta.GetLatestVersion()
			locator = workflowModel.FromLatestVersion
		}
	}

	if req.IsSetConversationID() && !req.IsSetBotID() {
		conversationID = mustParseInt64(req.GetConversationID())
		cInfo, err := crossconversation.DefaultSVC().GetByID(ctx, conversationID)
		if err != nil {
			return nil, err
		}
		sectionID = cInfo.SectionID

		//  only trust the conversation name under the app
		conversationName, existed, err := GetWorkflowDomainSVC().GetConversationNameByID(ctx, ternary.IFElse(isDebug, vo.Draft, vo.Online), bizID, connectorID, conversationID)
		if err != nil {
			return nil, err
		}
		if !existed {
			return nil, fmt.Errorf("conversation not found")
		}
		parameters[vo.ConversationNameKey] = conversationName
	} else if req.IsSetConversationID() && req.IsSetBotID() {
		parameters[vo.ConversationNameKey] = "Default"
		conversationID = mustParseInt64(req.GetConversationID())
		cInfo, err := crossconversation.DefaultSVC().GetByID(ctx, conversationID)
		if err != nil {
			return nil, err
		}
		sectionID = cInfo.SectionID
	} else {
		conversationName, ok := parameters[vo.ConversationNameKey].(string)
		if !ok {
			return nil, fmt.Errorf("conversation name is requried")
		}
		cID, sID, err := GetWorkflowDomainSVC().GetOrCreateConversation(ctx, ternary.IFElse(isDebug, vo.Draft, vo.Online), bizID, connectorID, userID, conversationName)
		if err != nil {
			return nil, err
		}
		conversationID = cID
		sectionID = sID
	}

	runRecord, err := crossagentrun.DefaultSVC().Create(ctx, &agententity.AgentRunMeta{
		AgentID:        bizID,
		ConversationID: conversationID,
		UserID:         strconv.FormatInt(userID, 10),
		ConnectorID:    connectorID,
		SectionID:      sectionID,
	})
	if err != nil {
		return nil, err
	}

	roundID := runRecord.ID

	userMessage, err := toConversationMessage(ctx, bizID, conversationID, userID, roundID, sectionID, message.MessageTypeQuestion, lastUserMessage)
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

	userSchemaMessage, err := toSchemaMessage(ctx, lastUserMessage)
	if err != nil {
		return nil, err
	}

	if existed {
		sr, err := GetWorkflowDomainSVC().StreamResume(ctx, &entity.ResumeRequest{
			EventID:    info.EventID,
			ExecuteID:  info.ExecID,
			ResumeData: lastUserMessage.Content,
		}, workflowModel.ExecuteConfig{
			Operator:     userID,
			Mode:         ternary.IFElse(isDebug, workflowModel.ExecuteModeDebug, workflowModel.ExecuteModeRelease),
			ConnectorID:  connectorID,
			ConnectorUID: strconv.FormatInt(userID, 10),
			BizType:      workflowModel.BizTypeWorkflow,
		})

		if err != nil {
			unErr := unbinding()
			if unErr != nil {
				logs.CtxErrorf(ctx, "unbinding failed, error: %v", unErr)
			}
			return nil, err
		}
		return schema.StreamReaderWithConvert(sr, w.convertToChatFlowRunResponseList(ctx, convertToChatFlowInfo{
			bizID:            bizID,
			conversationID:   conversationID,
			roundID:          roundID,
			workflowID:       workflowID,
			sectionID:        sectionID,
			unbinding:        unbinding,
			userMessage:      userSchemaMessage,
			suggestReplyInfo: req.GetSuggestReplyInfo(),
		})), nil

	}

	exeCfg := workflowModel.ExecuteConfig{
		ID:            mustParseInt64(req.GetWorkflowID()),
		From:          locator,
		Version:       version,
		Operator:      userID,
		Mode:          ternary.IFElse(isDebug, workflowModel.ExecuteModeDebug, workflowModel.ExecuteModeRelease),
		AppID:         appID,
		AgentID:       agentID,
		ConnectorID:   connectorID,
		ConnectorUID:  strconv.FormatInt(userID, 10),
		TaskType:      workflowModel.TaskTypeForeground,
		SyncPattern:   workflowModel.SyncPatternStream,
		InputFailFast: true,
		BizType:       workflowModel.BizTypeWorkflow,

		ConversationID: ptr.Of(conversationID),
		RoundID:        ptr.Of(roundID),
		InitRoundID:    ptr.Of(roundID),
		SectionID:      ptr.Of(sectionID),

		UserMessage: userSchemaMessage,
		Cancellable: isDebug,
	}

	historyMessages, err := makeChatFlowHistoryMessages(ctx, bizID, conversationID, userID, sectionID, connectorID, messages[:len(req.GetAdditionalMessages())-1])
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
	parameters[vo.UserInputKey], err = w.makeChatFlowUserInput(ctx, lastUserMessage)
	if err != nil {
		return nil, err
	}

	sr, err := GetWorkflowDomainSVC().StreamExecute(ctx, exeCfg, parameters)
	if err != nil {
		return nil, err
	}

	return schema.StreamReaderWithConvert(sr, w.convertToChatFlowRunResponseList(ctx, convertToChatFlowInfo{
		bizID:            bizID,
		conversationID:   conversationID,
		roundID:          roundID,
		workflowID:       workflowID,
		sectionID:        sectionID,
		unbinding:        unbinding,
		userMessage:      userSchemaMessage,
		suggestReplyInfo: req.GetSuggestReplyInfo(),
	})), nil

}

func (w *ApplicationService) convertToChatFlowRunResponseList(ctx context.Context, info convertToChatFlowInfo) func(msg *entity.Message) (responses []*workflow.ChatFlowRunResponse, err error) {
	var (
		bizID          = info.bizID
		conversationID = info.conversationID
		roundID        = info.roundID
		workflowID     = info.workflowID
		sectionID      = info.sectionID
		unbinding      = info.unbinding
		userMessage    = info.userMessage
		spaceID        int64
		executeID      int64

		intermediateMessage *message.Message

		needRegeneratedMessage = true

		messageDetailID int64
	)

	return func(msg *entity.Message) (responses []*workflow.ChatFlowRunResponse, err error) {
		defer func() {
			if err != nil {
				if unbinding != nil {
					unErr := unbinding()
					if unErr != nil {
						logs.CtxErrorf(ctx, "unbinding failed, error: %v", unErr)
					}
				}
				if intermediateMessage != nil {
					_, mErr := crossmessage.DefaultSVC().Create(ctx, intermediateMessage)
					if mErr != nil {
						logs.CtxWarnf(ctx, "create message faield, err: %v", err)
					}
				}
			}

		}()

		if msg.StateMessage != nil {
			if executeID > 0 && executeID != msg.StateMessage.ExecuteID {
				return nil, schema.ErrNoValue
			}
			switch msg.StateMessage.Status {
			case entity.WorkflowSuccess:
				suggestWorkflowResponse := make([]*workflow.ChatFlowRunResponse, 0, 3)
				if info.suggestReplyInfo != nil && info.suggestReplyInfo.IsSetSuggestReplyMode() && info.suggestReplyInfo.GetSuggestReplyMode() != workflow.SuggestReplyInfoMode_Disable {
					sInfo := &vo.SuggestInfo{
						UserInput:    userMessage,
						AnswerInput:  schema.AssistantMessage(intermediateMessage.Content, nil),
						PersonaInput: info.suggestReplyInfo.CustomizedSuggestPrompt,
					}

					suggests, err := GetWorkflowDomainSVC().Suggest(ctx, sInfo)
					if err != nil {
						return nil, err
					}

					for index, s := range suggests {
						suggestWorkflowResponse = append(suggestWorkflowResponse, &workflow.ChatFlowRunResponse{
							Event: string(vo.ChatFlowMessageCompleted),
							Data: func() string {
								s, _ := sonic.MarshalString(&vo.MessageDetail{
									ID:             strconv.FormatInt(time.Now().UnixNano()+int64(index), 10),
									ChatID:         strconv.FormatInt(roundID, 10),
									ConversationID: strconv.FormatInt(conversationID, 10),
									SectionID:      strconv.FormatInt(sectionID, 10),
									BotID:          strconv.FormatInt(bizID, 10),
									Role:           string(schema.Assistant),
									Type:           "follow_up",
									ContentType:    "text",
									Content:        s,
								})
								return s
							}(),
						})

					}
				}

				chatDoneEvent := &vo.ChatFlowDetail{
					ID:             strconv.FormatInt(roundID, 10),
					ConversationID: strconv.FormatInt(conversationID, 10),
					SectionID:      strconv.FormatInt(sectionID, 10),
					BotID:          strconv.FormatInt(bizID, 10),
					Status:         vo.Completed,
					ExecuteID:      strconv.FormatInt(executeID, 10),
				}

				if msg.StateMessage.Usage != nil {
					chatDoneEvent.Usage = &vo.Usage{
						InputTokens:  &msg.StateMessage.Usage.InputTokens,
						OutputTokens: &msg.StateMessage.Usage.OutputTokens,
						TokenCount:   ptr.Of(msg.StateMessage.Usage.OutputTokens + msg.StateMessage.Usage.OutputTokens),
					}
				}

				data, err := sonic.MarshalString(chatDoneEvent)
				if err != nil {
					return nil, err
				}

				doneData, err := sonic.MarshalString(map[string]interface{}{
					"debug_url": fmt.Sprintf(workflowModel.DebugURLTpl, executeID, spaceID, workflowID),
				})
				if err != nil {
					return nil, err
				}

				if unbinding != nil {
					unErr := unbinding()
					if unErr != nil {
						logs.CtxErrorf(ctx, "unbinding failed, error: %v", unErr)
					}
				}

				return append(suggestWorkflowResponse, []*workflow.ChatFlowRunResponse{
					{
						Event: string(vo.ChatFlowCompleted),
						Data:  data,
					},
					{
						Event: string(vo.ChatFlowDone),
						Data:  doneData,
					},
				}...), nil

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
				if intermediateMessage != nil {
					_, err := crossmessage.DefaultSVC().Create(ctx, intermediateMessage)
					if err != nil {
						return nil, err
					}
				}

				if unbinding != nil {
					unErr := unbinding()
					if unErr != nil {
						logs.CtxErrorf(ctx, "unbinding failed, error: %v", unErr)
					}
				}

				return []*workflow.ChatFlowRunResponse{
					{
						Event: string(vo.ChatFlowError),
						Data:  data,
					},
				}, err

			case entity.WorkflowCancel:
				if intermediateMessage != nil {
					_, err := crossmessage.DefaultSVC().Create(ctx, intermediateMessage)
					if err != nil {
						return nil, err
					}
				}

				if unbinding != nil {
					unErr := unbinding()
					if unErr != nil {
						logs.CtxErrorf(ctx, "unbinding failed, error: %v", unErr)
					}
				}

			case entity.WorkflowInterrupted:

				var (
					interruptEvent = msg.StateMessage.InterruptEvent
					interruptData  = interruptEvent.InterruptData
					msgContent     string
					contentType    message.ContentType
				)

				if interruptEvent.EventType == entity.InterruptEventInput {
					msgContent, contentType, err = renderInputCardDSL(interruptData)
					if err != nil {
						return nil, err
					}
				} else if interruptEvent.EventType == entity.InterruptEventQuestion {
					msgContent, contentType, err = renderQACardDSL(interruptData)
					if err != nil {
						return nil, err
					}
				} else {
					return nil, fmt.Errorf("unsupported interrupt event type: %s", interruptEvent.EventType)
				}

				_, err = crossmessage.DefaultSVC().Create(ctx, &message.Message{
					AgentID:        bizID,
					RunID:          roundID,
					SectionID:      sectionID,
					Content:        msgContent,
					ConversationID: conversationID,
					Role:           schema.Assistant,
					MessageType:    message.MessageTypeAnswer,
					ContentType:    contentType,
				})
				if err != nil {
					return nil, err
				}

				completeData, _ := sonic.MarshalString(&vo.MessageDetail{
					ID:             strconv.FormatInt(interruptEvent.ID, 10),
					ChatID:         strconv.FormatInt(roundID, 10),
					ConversationID: strconv.FormatInt(conversationID, 10),
					SectionID:      strconv.FormatInt(sectionID, 10),
					BotID:          strconv.FormatInt(bizID, 10),
					Role:           string(schema.Assistant),
					Type:           string(entity.Answer),
					ContentType:    string(contentType),
					Content:        msgContent,
				})

				if contentType == message.ContentTypeText {
					responses = append(responses, &workflow.ChatFlowRunResponse{
						Event: string(vo.ChatFlowMessageDelta),
						Data:  completeData,
					})
				}

				responses = append(responses, &workflow.ChatFlowRunResponse{
					Event: string(vo.ChatFlowMessageCompleted),
					Data:  completeData,
				})

				data, _ := sonic.MarshalString(&vo.ChatFlowDetail{
					ID:             strconv.FormatInt(roundID, 10),
					ConversationID: strconv.FormatInt(conversationID, 10),
					SectionID:      strconv.FormatInt(sectionID, 10),
					Status:         vo.RequiresAction,
					ExecuteID:      strconv.FormatInt(executeID, 10),
				})

				doneData, _ := sonic.MarshalString(map[string]interface{}{
					"debug_url": fmt.Sprintf(workflowModel.DebugURLTpl, executeID, spaceID, workflowID),
				})

				responses = append(responses, &workflow.ChatFlowRunResponse{
					Event: string(vo.ChatFlowRequiresAction),
					Data:  data,
				}, &workflow.ChatFlowRunResponse{
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
					SectionID:      strconv.FormatInt(sectionID, 10),
				}

				data, _ := sonic.MarshalString(chatEvent)
				responses = append(responses, &workflow.ChatFlowRunResponse{
					Event: string(vo.ChatFlowCreated),
					Data:  data,
				})

				chatEvent.Status = vo.InProgress
				data, _ = sonic.MarshalString(chatEvent)
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
			if executeID > 0 && executeID != msg.DataMessage.ExecuteID {
				return nil, schema.ErrNoValue
			}
			if msg.DataMessage.NodeType == entity.NodeTypeQuestionAnswer || msg.DataMessage.NodeType == entity.NodeTypeInputReceiver {
				return nil, schema.ErrNoValue
			}
			dataMessage := msg.DataMessage

			if needRegeneratedMessage {
				id, err := w.IDGenerator.GenID(ctx)
				if err != nil {
					return nil, err
				}
				intermediateMessage = &message.Message{
					ID:             id,
					AgentID:        bizID,
					RunID:          roundID,
					SectionID:      sectionID,
					ConversationID: conversationID,
					Role:           schema.Assistant,
					MessageType:    message.MessageTypeAnswer,
					ContentType:    message.ContentTypeText,
				}
				messageDetailID = id
				needRegeneratedMessage = false

			}

			intermediateMessage.Content += msg.Content

			deltaData, _ := sonic.MarshalString(&vo.MessageDetail{
				ID:             strconv.FormatInt(messageDetailID, 10),
				ChatID:         strconv.FormatInt(roundID, 10),
				ConversationID: strconv.FormatInt(conversationID, 10),
				SectionID:      strconv.FormatInt(sectionID, 10),
				BotID:          strconv.FormatInt(bizID, 10),
				Role:           string(dataMessage.Role),
				Type:           string(dataMessage.Type),
				ContentType:    string(message.ContentTypeText),
				Content:        msg.Content,
			})

			if !msg.Last {
				return []*workflow.ChatFlowRunResponse{
					{
						Event: string(vo.ChatFlowMessageDelta),
						Data:  deltaData,
					},
				}, nil
			}

			_, err = crossmessage.DefaultSVC().Create(ctx, intermediateMessage)
			if err != nil {
				return nil, err
			}

			completeData, _ := sonic.MarshalString(&vo.MessageDetail{
				ID:             strconv.FormatInt(messageDetailID, 10),
				ChatID:         strconv.FormatInt(roundID, 10),
				ConversationID: strconv.FormatInt(conversationID, 10),
				SectionID:      strconv.FormatInt(sectionID, 10),
				BotID:          strconv.FormatInt(bizID, 10),
				Role:           string(dataMessage.Role),
				Type:           string(dataMessage.Type),
				ContentType:    string(message.ContentTypeText),
				Content:        intermediateMessage.Content,
			})
			needRegeneratedMessage = true

			return []*workflow.ChatFlowRunResponse{
				{
					Event: string(vo.ChatFlowMessageDelta),
					Data:  deltaData,
				},
				{
					Event: string(vo.ChatFlowMessageCompleted),
					Data:  completeData,
				},
			}, nil

		}

		return nil, err
	}
}

func (w *ApplicationService) makeChatFlowUserInput(ctx context.Context, message *workflow.EnterMessage) (string, error) {
	type content struct {
		Type   string  `json:"type"`
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
				fileID := mustParseInt64(*ct.FileID)
				file, err := crossupload.DefaultSVC().GetFile(ctx, &service.GetFileRequest{ID: fileID})
				if err != nil {
					return "", err
				}
				if file.File == nil {
					return "", fmt.Errorf("file not found")
				}
				urls = append(urls, file.File.Url)
			}
		}

		return strings.Join(append(texts, urls...), ","), nil

	} else {
		return "", fmt.Errorf("invalid message ccontent type %v", message.ContentType)
	}
}

func makeChatFlowHistoryMessages(ctx context.Context, bizID, conversationID, userID, sectionID, connectorID int64, messages []*workflow.EnterMessage) ([]*message.Message, error) {

	var (
		rID       int64
		err       error
		runRecord *agententity.RunRecordMeta
	)

	historyMessages := make([]*message.Message, 0, len(messages))

	for _, msg := range messages {
		if msg.Role == userRole {
			runRecord, err = crossagentrun.DefaultSVC().Create(ctx, &agententity.AgentRunMeta{
				AgentID:        bizID,
				ConversationID: conversationID,
				UserID:         strconv.FormatInt(userID, 10),
				ConnectorID:    connectorID,
				SectionID:      sectionID,
			})
			if err != nil {
				return nil, err
			}
			rID = runRecord.ID
		} else if msg.Role == assistantRole {
			if rID == 0 {
				continue
			}
		} else {
			return nil, fmt.Errorf("invalid role type %v", msg.Role)
		}

		m, err := toConversationMessage(ctx, bizID, conversationID, userID, rID, sectionID, ternary.IFElse(msg.Role == userRole, message.MessageTypeQuestion, message.MessageTypeAnswer), msg)
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
		var tplExisted, dcExisted bool
		var tplErr, dcErr error
		var wg sync.WaitGroup
		wg.Add(2)

		safego.Go(ctx, func() {
			defer wg.Done()
			_, tplExisted, tplErr = GetWorkflowDomainSVC().GetTemplateByName(ctx, env, appID, req.GetConversationMame())
		})

		safego.Go(ctx, func() {
			defer wg.Done()
			_, dcExisted, dcErr = GetWorkflowDomainSVC().GetDynamicConversationByName(ctx, env, appID, req.GetConnectorId(), userID, req.GetConversationMame())
		})

		wg.Wait()

		if tplErr != nil {
			return nil, tplErr
		}
		if dcErr != nil {
			return nil, dcErr
		}

		if !tplExisted && !dcExisted {
			return &workflow.CreateConversationResponse{
				Code: errno.ErrConversationNotFoundForOperation,
				Msg:  "Conversation not found. Please create a conversation before attempting to perform any related operations.",
			}, nil
		}

		cID, _, err = GetWorkflowDomainSVC().GetOrCreateConversation(ctx, env, appID, req.GetConnectorId(), userID, req.GetConversationMame())

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

func toConversationMessage(ctx context.Context, bizID, cid, userID, roundID, sectionID int64, messageType message.MessageType, msg *workflow.EnterMessage) (*message.Message, error) {
	type content struct {
		Type   string  `json:"type"`
		FileID *string `json:"file_id"`
		Text   *string `json:"text"`
	}
	if msg.ContentType == "text" {
		return &message.Message{
			Role:           schema.User,
			ConversationID: cid,
			AgentID:        bizID,
			RunID:          roundID,
			Content:        msg.Content,
			ContentType:    message.ContentTypeText,
			MessageType:    messageType,
			UserID:         strconv.FormatInt(userID, 10),
			SectionID:      sectionID,
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
			AgentID:        bizID,
			UserID:         strconv.FormatInt(userID, 10),
			RunID:          roundID,
			ContentType:    message.ContentTypeMix,
			DisplayContent: msg.Content,
			MultiContent:   make([]*message.InputMetaData, 0, len(contents)),
			SectionID:      sectionID,
		}

		for _, ct := range contents {
			if ct.Text != nil {
				m.MultiContent = append(m.MultiContent, &message.InputMetaData{
					Type: message.InputTypeText,
					Text: *ct.Text,
				})
			} else if ct.FileID != nil {
				fileID := mustParseInt64(*ct.FileID)
				file, err := crossupload.DefaultSVC().GetFile(ctx, &service.GetFileRequest{ID: fileID})
				if err != nil {
					return nil, err
				}
				if file.File == nil {
					return nil, fmt.Errorf("file not found")
				}

				m.MultiContent = append(m.MultiContent, &message.InputMetaData{
					Type: message.InputType(ct.Type),
					FileData: []*message.FileData{
						{
							Url:  file.File.Url,
							URI:  file.File.TosURI,
							Name: file.File.Name,
						},
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

func toSchemaMessage(ctx context.Context, msg *workflow.EnterMessage) (*schema.Message, error) {
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
				if len(*ct.Text) == 0 {
					continue
				}
				m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
					Type: schema.ChatMessagePartTypeText,
					Text: *ct.Text,
				})
			} else if ct.FileID != nil {
				fileID := mustParseInt64(*ct.FileID)
				file, err := crossupload.DefaultSVC().GetFile(ctx, &service.GetFileRequest{ID: fileID})
				if err != nil {
					return nil, err
				}
				if file.File == nil {
					return nil, fmt.Errorf("file not found")
				}
				switch ct.Type {
				case "file":
					m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
						Type: schema.ChatMessagePartTypeFileURL,
						FileURL: &schema.ChatMessageFileURL{
							URL: file.File.Url,
						},
					})
				case "image":
					m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
						Type: schema.ChatMessagePartTypeImageURL,
						ImageURL: &schema.ChatMessageImageURL{
							URL: file.File.Url,
						},
					})
				case "audio":
					m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
						Type: schema.ChatMessagePartTypeAudioURL,
						AudioURL: &schema.ChatMessageAudioURL{
							URL: file.File.Url,
						},
					})
				case "video":
					m.MultiContent = append(m.MultiContent, schema.ChatMessagePart{
						Type: schema.ChatMessagePartTypeVideoURL,
						VideoURL: &schema.ChatMessageVideoURL{
							URL: file.File.Url,
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
	userMessage      *schema.Message
	bizID            int64
	conversationID   int64
	roundID          int64
	workflowID       int64
	sectionID        int64
	unbinding        func() error
	suggestReplyInfo *workflow.SuggestReplyInfo
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

func renderInputCardDSL(c string) (string, message.ContentType, error) {
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
		return "", "", err
	}

	fields := make([]*field, 0)
	err = sonic.UnmarshalString(info.Content, &fields)
	if err != nil {
		return "", "", err
	}

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

	return rCardString, message.ContentTypeCard, nil

}

func renderQACardDSL(c string) (string, message.ContentType, error) {
	type contentInfo struct {
		Messages []struct {
			Type        string `json:"type"`
			ContentType string `json:"content_type"`
			Content     any    `json:"content"`
		} `json:"messages"`
	}

	info := &contentInfo{}
	err := sonic.UnmarshalString(c, info)
	if err != nil {
		return "", "", err
	}

	if len(info.Messages) == 0 {
		return "", "", fmt.Errorf("no input card data")
	}

	if info.Messages[0].ContentType == "text" {
		return info.Messages[0].Content.(string), message.ContentTypeText, nil
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
	iCard := defaultCard()
	keys := make([]*key, 0)
	fields := make([]*field, 0)

	content := info.Messages[0].Content
	type contentOption struct {
		Options  []*field `json:"options"`
		Question string   `json:"question"`
	}

	contentString, err := sonic.MarshalString(content)
	if err != nil {
		return "", "", err
	}

	contentOptionInfo := &contentOption{}
	err = sonic.UnmarshalString(contentString, contentOptionInfo)
	if err != nil {
		return "", "", err
	}

	for _, op := range contentOptionInfo.Options {
		keys = append(keys, &key{Key: op.Name})
		fields = append(fields, &field{Name: op.Name})
	}

	iCard.Variables["5fJt3qKpSz"].(map[string]any)["defaultValue"] = map[string]any{
		"description": contentOptionInfo.Question,
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
		}{Title: contentOptionInfo.Question, Options: fields},
	})

	rCard.XProperties = map[string]string{
		"workflow_card_info": propsString,
	}
	rCardString, _ := sonic.MarshalString(rCard)

	return rCardString, message.ContentTypeCard, nil

}
